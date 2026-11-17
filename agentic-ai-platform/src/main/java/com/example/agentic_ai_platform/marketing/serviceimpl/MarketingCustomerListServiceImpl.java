package com.example.agentic_ai_platform.marketing.serviceimpl;

import com.example.agentic_ai_platform.marketing.dto.CustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.CustomerListResponse;
import com.example.agentic_ai_platform.marketing.dto.AiCustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.ContactImportResponse;
import com.example.agentic_ai_platform.marketing.dto.MarketingContactResponse;
import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import com.example.agentic_ai_platform.marketing.entity.MarketingCustomerList;
import com.example.agentic_ai_platform.marketing.repository.MarketingContactRepository;
import com.example.agentic_ai_platform.marketing.repository.MarketingCustomerListRepository;
import com.example.agentic_ai_platform.marketing.service.MarketingCustomerListService;
import java.io.StringReader;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class MarketingCustomerListServiceImpl implements MarketingCustomerListService {
    private final MarketingCustomerListRepository repository;
    private final MarketingContactRepository contacts;
    private final GroqContactSelector selector;
    private final long maxFileBytes;
    private final int maxRows;
    private final int maxTotalContacts;
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Map<String, Integer> HEADER_LIMITS = Map.of(
            "email", 320, "firstname", 120, "lastname", 120, "company", 200, "title", 160,
            "industry", 120, "country", 120, "customerstatus", 80);

    public MarketingCustomerListServiceImpl(MarketingCustomerListRepository repository,
            MarketingContactRepository contacts, GroqContactSelector selector,
            @Value("${app.marketing.csv.max-file-bytes:5242880}") long maxFileBytes,
            @Value("${app.marketing.csv.max-rows:2000}") int maxRows,
            @Value("${app.marketing.csv.max-total-contacts:2000}") int maxTotalContacts) {
        this.repository = repository;
        this.contacts = contacts;
        this.selector = selector;
        this.maxFileBytes = maxFileBytes;
        this.maxRows = maxRows;
        this.maxTotalContacts = maxTotalContacts;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerListResponse> list(UUID tenantId) {
        return repository.findAllByTenantIdOrderByUpdatedAtDesc(tenantId).stream()
                .map(CustomerListResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerListResponse get(UUID tenantId, UUID id) {
        return CustomerListResponse.from(findForTenant(tenantId, id));
    }

    @Override
    public CustomerListResponse create(UUID tenantId, CustomerListRequest request) {
        MarketingCustomerList customerList = repository.save(
                new MarketingCustomerList(UUID.randomUUID(), tenantId, request));
        return CustomerListResponse.from(customerList);
    }

    @Override
    public CustomerListResponse update(UUID tenantId, UUID id, CustomerListRequest request) {
        MarketingCustomerList customerList = findForTenant(tenantId, id);
        customerList.updateFrom(request);
        return CustomerListResponse.from(repository.save(customerList));
    }

    @Override
    public void delete(UUID tenantId, UUID id) {
        repository.delete(findForTenant(tenantId, id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketingContactResponse> contacts(UUID tenantId) {
        return contacts.findAllByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(MarketingContactResponse::from).toList();
    }

    @Override
    public ContactImportResponse importContacts(UUID tenantId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file is required");
        }
        if (file.getSize() > maxFileBytes) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "CSV file exceeds configured size limit");
        }
        String csv;
        try {
            csv = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(file.getBytes())).toString();
            if (csv.startsWith("\uFEFF")) {
                csv = csv.substring(1);
            }
        } catch (CharacterCodingException exception) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "CSV must be valid UTF-8");
        } catch (java.io.IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded CSV");
        }

        List<ContactImportResponse.RowError> errors = new ArrayList<>();
        List<MarketingContact> importedContacts = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        Set<String> existing = new HashSet<>();
        contacts.findAllByTenantIdOrderByCreatedAtDesc(tenantId).forEach(contact -> existing.add(contact.getEmail()));
        int duplicates = 0;
        int invalid = 0;
        int processed = 0;
        try (CSVParser parser = CSVParser.parse(new StringReader(csv),
                CSVFormat.RFC4180.builder().setHeader().setSkipHeaderRecord(true).build())) {
            Map<String, Integer> headerIndexes = validateHeaders(parser.getHeaderMap());
            for (CSVRecord record : parser) {
                if (record.size() == 1 && record.get(0).isBlank()) {
                    continue;
                }
                processed++;
                if (processed > maxRows) {
                    throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                            "CSV exceeds configured row limit of " + maxRows);
                }
                try {
                    Integer emailIdx = headerIndexes.get("email");
                    if (emailIdx == null || emailIdx >= record.size() || record.get(emailIdx).isBlank()) {
                        throw new IllegalArgumentException("Row is missing required email value");
                    }
                    MarketingContact contact = contactFromRecord(tenantId, record, headerIndexes);
                    String email = contact.getEmail();
                    if (existing.contains(email) || !seen.add(email)) {
                        duplicates++;
                    } else {
                        importedContacts.add(contact);
                    }
                } catch (IllegalArgumentException exception) {
                    invalid++;
                    if (errors.size() < 100) {
                        errors.add(new ContactImportResponse.RowError((int) record.getRecordNumber() + 1,
                                exception.getMessage()));
                    }
                }
            }
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "CSV is malformed or has invalid headers: " + exception.getMessage());
        }
        if (existing.size() + importedContacts.size() > maxTotalContacts) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "Tenant contact limit of " + maxTotalContacts + " would be exceeded");
        }
        contacts.saveAll(importedContacts);
        return new ContactImportResponse(importedContacts.size(), duplicates, invalid, processed, errors);
    }

    @Override
    public CustomerListResponse generate(UUID tenantId, AiCustomerListRequest request) {
        List<MarketingContact> tenantContacts = request.sourceListId() == null
                ? contacts.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                : repository.findMembersByListAndTenant(request.sourceListId(), tenantId);
        if (tenantContacts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Import contacts before generating a customer list");
        }
        List<UUID> selectedIds = selector.select(request.prompt().trim(), tenantContacts);
        Map<UUID, MarketingContact> byId = new HashMap<>();
        tenantContacts.forEach(contact -> byId.put(contact.getId(), contact));
        Set<MarketingContact> members = new HashSet<>();
        for (UUID selectedId : selectedIds) {
            MarketingContact contact = byId.get(selectedId);
            if (contact == null || !contact.getTenantId().equals(tenantId)) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Groq provider selected a contact outside the tenant dataset");
            }
            members.add(contact);
        }
        String description = request.prompt().trim();
        String name = request.name() == null || request.name().isBlank()
                ? "AI selection: " + truncate(description, 146)
                : request.name().trim();
        CustomerListRequest metadata = new CustomerListRequest(name, description, members.size(),
                BigDecimal.ZERO.setScale(2), "AI Selection", "ACTIVE", true);
        MarketingCustomerList customerList = new MarketingCustomerList(UUID.randomUUID(), tenantId, metadata);
        customerList.addMembers(members);
        return CustomerListResponse.from(repository.save(customerList));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarketingContactResponse> members(UUID tenantId, UUID listId) {
        findForTenant(tenantId, listId);
        return repository.findMembersByListAndTenant(listId, tenantId).stream()
                .map(MarketingContactResponse::from).toList();
    }

    private Map<String, Integer> validateHeaders(Map<String, Integer> rawHeaders) {
        if (rawHeaders == null || rawHeaders.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "CSV header row is required");
        }
        Map<String, Integer> indexes = new HashMap<>();
        rawHeaders.forEach((header, index) -> {
            if (header == null || header.trim().isEmpty()) {
                return; // ignore trailing empty columns from Excel exports
            }
            String canonical = canonicalHeader(header);
            if (!canonical.isEmpty()) {
                if (indexes.putIfAbsent(canonical, index) != null) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Duplicate CSV header: " + header);
                }
            }
        });
        if (!indexes.containsKey("email")) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "CSV requires an email header (e.g. 'email', 'Email Address')");
        }
        return indexes;
    }

    private static String canonicalHeader(String raw) {
        if (raw == null) return "";
        String clean = raw.trim().toLowerCase(Locale.ROOT).replaceAll("[\\s_\\-]+", "");
        return switch (clean) {
            case "email", "emailaddress", "mail" -> "email";
            case "firstname", "first", "fname" -> "firstname";
            case "lastname", "last", "lname", "surname" -> "lastname";
            case "company", "companyname", "organization", "org" -> "company";
            case "title", "jobtitle", "designation", "role" -> "title";
            case "industry", "sector" -> "industry";
            case "country", "location", "nation" -> "country";
            case "customerstatus", "status" -> "customerstatus";
            case "annualrevenue", "revenue" -> "annualrevenue";
            case "churnprobability", "churn" -> "churnprobability";
            default -> {
                if (HEADER_LIMITS.containsKey(clean) || clean.equals("annualrevenue") || clean.equals("churnprobability")) {
                    yield clean;
                }
                yield ""; // safely ignore unknown optional columns (like phone, id, notes)
            }
        };
    }

    private MarketingContact contactFromRecord(UUID tenantId, CSVRecord record, Map<String, Integer> indexes) {
        String email = value(record, indexes, "email").toLowerCase(Locale.ROOT);
        if (email.length() > 320 || !EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email");
        }
        BigDecimal revenue = decimal(value(record, indexes, "annualrevenue"), "annualRevenue");
        if (revenue != null && (revenue.signum() < 0 || revenue.precision() > 19 || scale(revenue) > 2)) {
            throw new IllegalArgumentException("annualRevenue must be non-negative with at most 2 decimals");
        }
        BigDecimal churn = decimal(value(record, indexes, "churnprobability"), "churnProbability");
        if (churn != null && (churn.signum() < 0 || churn.compareTo(BigDecimal.valueOf(100)) > 0
                || churn.precision() > 5 || scale(churn) > 2)) {
            throw new IllegalArgumentException("churnProbability must be 0 to 100 with at most 2 decimals");
        }
        return new MarketingContact(UUID.randomUUID(), tenantId, email,
                optional(value(record, indexes, "firstname"), "firstName"),
                optional(value(record, indexes, "lastname"), "lastName"),
                optional(value(record, indexes, "company"), "company"),
                optional(value(record, indexes, "title"), "title"),
                optional(value(record, indexes, "industry"), "industry"),
                optional(value(record, indexes, "country"), "country"),
                revenue,
                optional(value(record, indexes, "customerstatus"), "customerStatus"),
                churn);
    }

    private String value(CSVRecord record, Map<String, Integer> indexes, String name) {
        Integer index = indexes.get(name);
        return index == null || index >= record.size() ? "" : record.get(index).trim();
    }

    private String optional(String value, String name) {
        if (value.isBlank()) {
            return null;
        }
        if (value.length() > HEADER_LIMITS.get(name.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException(name + " is too long");
        }
        return value;
    }

    private BigDecimal decimal(String raw, String name) {
        if (raw.isBlank()) {
            return null;
        }
        try {
            String cleaned = raw.replaceAll("[$,%\\s]", "");
            return new BigDecimal(cleaned);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(name + " must be a number");
        }
    }

    private int scale(BigDecimal number) {
        return Math.max(0, number.stripTrailingZeros().scale());
    }

    private String truncate(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength).trim();
    }

    private MarketingCustomerList findForTenant(UUID tenantId, UUID id) {
        return repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer list not found"));
    }
}
