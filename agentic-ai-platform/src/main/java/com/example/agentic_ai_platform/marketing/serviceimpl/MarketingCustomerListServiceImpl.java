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
    private static final Map<String, Integer> HEADER_LIMITS = Map.ofEntries(
            Map.entry("email", 320),
            Map.entry("firstname", 120),
            Map.entry("lastname", 120),
            Map.entry("company", 200),
            Map.entry("title", 160),
            Map.entry("industry", 120),
            Map.entry("country", 120),
            Map.entry("customerstatus", 80),
            Map.entry("category", 160),
            Map.entry("type", 160),
            Map.entry("parentorganization", 255),
            Map.entry("siterole", 160),
            Map.entry("phone", 80),
            Map.entry("address", 255),
            Map.entry("city", 120),
            Map.entry("postalcode", 40),
            Map.entry("region", 120),
            Map.entry("website", 255),
            Map.entry("contactcheck", 120),
            Map.entry("source", 160),
            Map.entry("notes", 4000)
    );

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
        return importContacts(tenantId, file, null, null);
    }

    @Override
    public ContactImportResponse importContacts(UUID tenantId, MultipartFile file, String folderName, UUID targetListId) {
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

        char delimiter = ',';
        if (csv.contains("\t") && !csv.contains(",")) {
            delimiter = '\t';
        } else if (csv.contains(";") && !csv.contains(",")) {
            delimiter = ';';
        } else if (csv.indexOf('\n') != -1) {
            String firstLine = csv.substring(0, csv.indexOf('\n'));
            long tabs = firstLine.chars().filter(ch -> ch == '\t').count();
            long commas = firstLine.chars().filter(ch -> ch == ',').count();
            long semicolons = firstLine.chars().filter(ch -> ch == ';').count();
            if (tabs > commas && tabs > semicolons) {
                delimiter = '\t';
            } else if (semicolons > commas && semicolons > tabs) {
                delimiter = ';';
            }
        }

        CSVFormat csvFormat = CSVFormat.RFC4180.builder()
                .setDelimiter(delimiter)
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build();

        try (CSVParser parser = CSVParser.parse(new StringReader(csv), csvFormat)) {
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

        UUID folderId = null;
        String resolvedFolderName = null;
        if (folderName != null && !folderName.trim().isBlank()) {
            resolvedFolderName = folderName.trim();
            CustomerListRequest listReq = new CustomerListRequest(
                    resolvedFolderName,
                    "Imported folder from " + (file.getOriginalFilename() != null ? file.getOriginalFilename() : "CSV file"),
                    importedContacts.size(),
                    BigDecimal.ZERO.setScale(2),
                    "Imported Folder",
                    "ACTIVE",
                    false
            );
            MarketingCustomerList customerList = new MarketingCustomerList(UUID.randomUUID(), tenantId, listReq);
            customerList.addMembers(new HashSet<>(importedContacts));
            MarketingCustomerList saved = repository.save(customerList);
            folderId = saved.getId();
        } else if (targetListId != null) {
            MarketingCustomerList customerList = findForTenant(tenantId, targetListId);
            customerList.addMembers(new HashSet<>(importedContacts));
            MarketingCustomerList saved = repository.save(customerList);
            folderId = saved.getId();
            resolvedFolderName = saved.getName();
        }

        return new ContactImportResponse(importedContacts.size(), duplicates, invalid, processed, errors, folderId, resolvedFolderName);
    }

    @Override
    public void deleteAllContacts(UUID tenantId) {
        List<MarketingCustomerList> tenantLists = repository.findAllByTenantIdOrderByUpdatedAtDesc(tenantId);
        for (MarketingCustomerList list : tenantLists) {
            list.getMembers().clear();
            CustomerListRequest updateReq = new CustomerListRequest(
                    list.getName(), list.getDescription(), 0, list.getConversionRate(),
                    list.getSegment(), list.getStatus(), list.isAiGenerated()
            );
            list.updateFrom(updateReq);
        }
        repository.saveAll(tenantLists);
        contacts.deleteAllByTenantId(tenantId);
    }

    @Override
    public void deleteContact(UUID tenantId, UUID contactId) {
        contacts.deleteByTenantIdAndId(tenantId, contactId);
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
                indexes.put(canonical, index);
            }
        });

        boolean hasEmail = indexes.containsKey("email") || indexes.containsKey("emailaddress")
                || indexes.containsKey("mail") || indexes.containsKey("contactemail")
                || rawHeaders.keySet().stream().anyMatch(h -> h != null && h.toLowerCase(Locale.ROOT).contains("email"));
        if (!hasEmail) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "CSV requires an email header (e.g. 'Email', 'email', 'Email Address')");
        }
        return indexes;
    }

    private static String canonicalHeader(String raw) {
        if (raw == null) return "";
        return raw.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private String firstNonBlank(CSVRecord record, Map<String, Integer> indexes, String... candidates) {
        for (String candidate : candidates) {
            Integer idx = indexes.get(candidate);
            if (idx != null && idx < record.size()) {
                String val = record.get(idx).trim();
                if (!val.isBlank() && !val.equals("—") && !val.equalsIgnoreCase("null") && !val.equalsIgnoreCase("n/a")) {
                    return val;
                }
            }
        }
        return "";
    }

    private static String capitalize(String str) {
        if (str == null || str.isBlank()) return "";
        str = str.trim();
        return Character.toUpperCase(str.charAt(0)) + (str.length() > 1 ? str.substring(1).toLowerCase(Locale.ROOT) : "");
    }

    private MarketingContact contactFromRecord(UUID tenantId, CSVRecord record, Map<String, Integer> indexes) {
        String email = firstNonBlank(record, indexes, "email", "emailaddress", "mail", "contactemail").toLowerCase(Locale.ROOT);
        if (email.isBlank() || email.length() > 320 || !EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email: " + (email.isBlank() ? "empty" : email));
        }

        // 1. Company / Organization
        String company = firstNonBlank(record, indexes, "company", "companyname", "organizationsite", "organization", "parentorganization", "org", "businessname", "institution", "account");

        // 2. Industry / Category / Type
        String industry = firstNonBlank(record, indexes, "industry", "category", "type", "sector", "vertical", "sitetype", "orgcategory");

        // 3. Country / Location / Region / City
        String country = firstNonBlank(record, indexes, "country", "nation");
        if (country.isBlank()) {
            String city = firstNonBlank(record, indexes, "city", "town");
            String region = firstNonBlank(record, indexes, "region", "state", "province");
            if (!city.isBlank() && !region.isBlank()) {
                country = city + ", " + region;
            } else if (!region.isBlank()) {
                country = region;
            } else if (!city.isBlank()) {
                country = city;
            } else {
                country = firstNonBlank(record, indexes, "address", "location");
            }
        }
        if (email.endsWith(".ca")) {
            if (country.isBlank()) {
                country = "Canada";
            } else if (!country.toLowerCase(Locale.ROOT).contains("canada")) {
                country = country + ", Canada";
            }
        }

        // 4. Title / Site Role
        String title = firstNonBlank(record, indexes, "title", "jobtitle", "designation", "role", "siterole", "contactcheck");

        // 5. Name (First & Last)
        String firstName = firstNonBlank(record, indexes, "firstname", "first", "fname");
        String lastName = firstNonBlank(record, indexes, "lastname", "last", "lname", "surname");
        if (firstName.isBlank() && lastName.isBlank()) {
            String fullName = firstNonBlank(record, indexes, "name", "fullname", "contactname", "contactperson", "contact");
            if (!fullName.isBlank()) {
                String[] parts = fullName.trim().split("\\s+", 2);
                firstName = parts[0];
                if (parts.length > 1) {
                    lastName = parts[1];
                }
            }
        }

        // Intelligent fallback if Name is still blank so UI and AI never show empty "—"
        if (firstName.isBlank() && lastName.isBlank()) {
            String local = email.contains("@") ? email.split("@")[0] : "";
            if (local.contains(".")) {
                String[] parts = local.split("\\.", 2);
                firstName = capitalize(parts[0]);
                lastName = capitalize(parts[1].replace(".", " "));
            } else if (!company.isBlank()) {
                firstName = company;
                lastName = "Team";
            } else if (!local.isBlank() && !local.equalsIgnoreCase("info") && !local.equalsIgnoreCase("contact") && !local.equalsIgnoreCase("admin")) {
                firstName = capitalize(local);
                lastName = "Contact";
            } else {
                firstName = "Primary";
                lastName = "Contact";
            }
        }

        // 6. Status (default ACTIVE)
        String status = firstNonBlank(record, indexes, "customerstatus", "status", "accountstatus", "state");
        if (status.isBlank()) {
            status = "ACTIVE";
        } else {
            status = status.toUpperCase(Locale.ROOT);
        }

        // 7. Revenue
        BigDecimal revenue = decimal(firstNonBlank(record, indexes, "annualrevenue", "revenue", "turnover", "arr", "sales"), "annualRevenue");

        // 8. Churn Probability
        BigDecimal churn = decimal(firstNonBlank(record, indexes, "churnprobability", "churn", "churnpercent", "churnrate", "risk"), "churnProbability");

        // 9. Exact Directory Entities / Fields
        String category = firstNonBlank(record, indexes, "category", "orgcategory");
        String type = firstNonBlank(record, indexes, "type", "sitetype", "organizationtype");
        String parentOrg = firstNonBlank(record, indexes, "parentorganization", "parentorg", "parent");
        String siteRole = firstNonBlank(record, indexes, "siterole", "role");
        String phone = firstNonBlank(record, indexes, "phone", "phonenumber", "telephone", "tel", "mobile");
        String address = firstNonBlank(record, indexes, "address", "street", "streetaddress", "location");
        String city = firstNonBlank(record, indexes, "city", "town");
        String postalCode = firstNonBlank(record, indexes, "postalcode", "postal", "zip", "zipcode", "postcode");
        String region = firstNonBlank(record, indexes, "region", "province", "state");
        String website = firstNonBlank(record, indexes, "website", "web", "url", "siteurl");
        String contactCheck = firstNonBlank(record, indexes, "contactcheck", "check", "verification", "verified");
        String source = firstNonBlank(record, indexes, "source", "leadsource", "datasource");
        String notes = firstNonBlank(record, indexes, "notes", "note", "comments", "description");

        // Cross-field fallbacks:
        if (company.isBlank() && !parentOrg.isBlank()) {
            company = parentOrg;
        }
        if (industry.isBlank()) {
            if (!category.isBlank() && !type.isBlank()) {
                industry = category + " · " + type;
            } else if (!category.isBlank()) {
                industry = category;
            } else if (!type.isBlank()) {
                industry = type;
            }
        }
        if (title.isBlank() && !siteRole.isBlank()) {
            title = siteRole;
        }

        return new MarketingContact(
                UUID.randomUUID(), tenantId, email,
                optional(firstName, "firstName"),
                optional(lastName, "lastName"),
                optional(company, "company"),
                optional(title, "title"),
                optional(industry, "industry"),
                optional(country, "country"),
                revenue,
                optional(status, "customerStatus"),
                churn,
                optional(category, "category"),
                optional(type, "type"),
                optional(parentOrg, "parentorganization"),
                optional(siteRole, "siterole"),
                optional(phone, "phone"),
                optional(address, "address"),
                optional(city, "city"),
                optional(postalCode, "postalcode"),
                optional(region, "region"),
                optional(website, "website"),
                optional(contactCheck, "contactcheck"),
                optional(source, "source"),
                optional(notes, "notes")
        );
    }

    private String optional(String value, String name) {
        if (value == null || value.isBlank()) {
            return null;
        }
        Integer limit = HEADER_LIMITS.get(name.toLowerCase(Locale.ROOT));
        if (limit != null && value.length() > limit) {
            return value.substring(0, limit).trim();
        }
        return value.trim();
    }

    private BigDecimal decimal(String raw, String name) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            String cleaned = raw.replaceAll("[$,%\\s]", "");
            if (cleaned.isBlank() || cleaned.equals("—") || cleaned.equalsIgnoreCase("n/a") || cleaned.equalsIgnoreCase("null")) {
                return null;
            }
            BigDecimal parsed = new BigDecimal(cleaned);
            if (parsed.signum() < 0) return null;
            return parsed;
        } catch (Exception exception) {
            return null;
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
