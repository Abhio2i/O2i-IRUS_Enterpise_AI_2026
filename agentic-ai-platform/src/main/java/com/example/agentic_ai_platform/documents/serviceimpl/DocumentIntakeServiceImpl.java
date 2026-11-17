package com.example.agentic_ai_platform.documents.serviceimpl;

import com.example.agentic_ai_platform.documents.dto.DocumentResponse;
import com.example.agentic_ai_platform.documents.dto.DocumentFileResponse;
import com.example.agentic_ai_platform.documents.entity.DocumentContent;
import com.example.agentic_ai_platform.documents.entity.Document;
import com.example.agentic_ai_platform.documents.repository.DocumentContentRepository;
import com.example.agentic_ai_platform.documents.repository.DocumentRepository;
import com.example.agentic_ai_platform.documents.service.DocumentIntakeService;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class DocumentIntakeServiceImpl implements DocumentIntakeService {
    private final DocumentRepository repository;
    private final DocumentContentRepository contentRepository;
    private final Tika tika = new Tika();
    private final long maxBytes;
    private final double minConfidence;
    private final BigDecimal autoApprovalLimit;
    public DocumentIntakeServiceImpl(DocumentRepository repository, DocumentContentRepository contentRepository,
            @Value("${app.documents.max-file-bytes:20971520}") long maxBytes,
            @Value("${app.documents.min-confidence:90}") double minConfidence,
            @Value("${app.documents.auto-approval-limit:10000}") BigDecimal autoApprovalLimit) {
        this.repository=repository; this.maxBytes=maxBytes; this.minConfidence=minConfidence; this.autoApprovalLimit=autoApprovalLimit;
        this.contentRepository = contentRepository;
    }
    @Override public DocumentResponse ingest(UUID tenantId, String user, MultipartFile file, String type, String source) {
        if (file.isEmpty() || file.getSize() > maxBytes) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty or exceeds configured size limit");
        try {
            byte[] bytes=file.getBytes(); String hash=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
            String contentType = tika.detect(bytes);
            boolean duplicate=repository.existsByTenantIdAndContentSha256(tenantId, hash);
            String text=tika.parseToString(new java.io.ByteArrayInputStream(bytes));
            Map<String,Object> fields=new LinkedHashMap<>(); Map<String,Double> scores=new LinkedHashMap<>();
            extract(text, fields, scores, "invoiceNumber", "(?i)(?:invoice\\s*(?:number|no\\.?|#)?)\\s*[:#]?\\s*([A-Z0-9-]{3,})");
            extract(text, fields, scores, "vendorName", "(?im)^\\s*(?:vendor|supplier)\\s*[:#]?\\s*(.+)$");
            extract(text, fields, scores, "totalAmount", "(?i)(?:total(?:\\s+amount)?|amount\\s+due)\\s*[:$ ]+([$â‚¬Â£]?\\s*[0-9,]+(?:\\.[0-9]{2})?)");
            extract(text, fields, scores, "taxId", "(?i)(?:tax\\s*id|vat)\\s*[:#]?\\s*([A-Z0-9-]+)");
            extract(text, fields, scores, "issueDate", "(?i)(?:issue\\s*date|invoice\\s*date)\\s*[:#]?\\s*([0-9]{4}-[0-9]{2}-[0-9]{2})");
            double overall=scores.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);
            List<String> reasons=new ArrayList<>(); if (duplicate) reasons.add("Duplicate document content");
            if (scores.values().stream().anyMatch(s -> s < minConfidence)) reasons.add("One or more extracted fields are below confidence threshold");
            Object amount=fields.get("totalAmount"); if (amount != null && money(amount.toString()).compareTo(autoApprovalLimit)>0) reasons.add("Amount exceeds auto-approval limit " + autoApprovalLimit);
            if(fields.isEmpty()) reasons.add("No supported invoice fields were extracted");
            Document document=repository.save(new Document(UUID.randomUUID(), tenantId, safeName(file.getOriginalFilename()), contentType, file.getSize(), type, source, user, hash, text, fields, scores, BigDecimal.valueOf(overall).setScale(2, java.math.RoundingMode.HALF_UP), reasons.isEmpty()?"PROCESSED":"EXCEPTION", String.join("; ",reasons)));
            contentRepository.save(new DocumentContent(document.getId(), bytes));
            return DocumentResponse.from(document);
        } catch (ResponseStatusException ex) { throw ex; } catch (Exception ex) { throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Could not parse uploaded document"); }
    }
    @Override @Transactional(readOnly=true) public List<DocumentResponse> list(UUID tenantId) { return repository.findAllByTenantIdOrderByCreatedAtDesc(tenantId).stream().map(DocumentResponse::from).toList(); }
    @Override @Transactional(readOnly=true) public DocumentResponse get(UUID tenantId, UUID id) { return repository.findById(id).filter(d->d.getTenantId().equals(tenantId)).map(DocumentResponse::from).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND)); }
    @Override @Transactional(readOnly=true) public DocumentFileResponse getOriginalFile(UUID tenantId, UUID id) {
        Document document = repository.findById(id).filter(d -> d.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        DocumentContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Original file is not available"));
        return new DocumentFileResponse(document.getOriginalFilename(), document.getContentType(), content.getContent());
    }
    @Override public void delete(UUID tenantId, UUID id) {
        Document document = repository.findById(id)
                .filter(d -> d.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        repository.delete(document);
    }
    private void extract(String text, Map<String,Object> fields, Map<String,Double> scores, String key, String regex) { Matcher m=Pattern.compile(regex).matcher(text); if(m.find()){fields.put(key,m.group(1).trim()); scores.put(key, key.equals("taxId")?85.0:95.0);} }
    private BigDecimal money(String raw) { return new BigDecimal(raw.replaceAll("[^0-9.]", "").replace(",", "")); }
    private String safeName(String n) { if(n==null || n.isBlank()) return "upload"; return n.replaceAll("[\\\\/]", "_"); }
}
