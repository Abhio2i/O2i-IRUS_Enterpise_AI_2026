package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.documents.dto.DocumentFileResponse;
import com.example.agentic_ai_platform.marketing.dto.MarketingAssetResponse;
import com.example.agentic_ai_platform.documents.entity.Document;
import com.example.agentic_ai_platform.documents.repository.DocumentContentRepository;
import com.example.agentic_ai_platform.documents.repository.DocumentRepository;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import org.apache.tika.Tika;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/assets")
public class MarketingAssetController {
    private static final long MAX_BYTES = 20L * 1024 * 1024;
    private final DocumentRepository documents;
    private final DocumentContentRepository contents;
    private final Tika tika = new Tika();

    public MarketingAssetController(DocumentRepository documents, DocumentContentRepository contents) {
        this.documents = documents;
        this.contents = contents;
    }

    @GetMapping public List<MarketingAssetResponse> list(JwtAuthenticationToken auth) {
        return documents.findAllByTenantIdOrderByCreatedAtDesc(tenant(auth)).stream()
                .filter(MarketingAssetController::isAsset).map(MarketingAssetResponse::from).toList();
    }

    @GetMapping("/folders") public List<String> folders(JwtAuthenticationToken auth) {
        LinkedHashSet<String> names = new LinkedHashSet<>();
        documents.findAllByTenantIdOrderByCreatedAtDesc(tenant(auth)).stream().filter(MarketingAssetController::isAsset)
                .map(MarketingAssetResponse::from).map(MarketingAssetResponse::folder).forEach(names::add);
        return names.stream().sorted().toList();
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public MarketingAssetResponse upload(@RequestParam MultipartFile file, @RequestParam String type,
            @RequestParam(defaultValue="General") String folder,
            JwtAuthenticationToken auth) {
        if (!type.equals("BROCHURE") && !type.equals("CATALOG")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be BROCHURE or CATALOG");
        if (file.isEmpty() || file.getSize() > MAX_BYTES) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty or exceeds 20 MiB");
        try {
            UUID tenant = tenant(auth); byte[] bytes = file.getBytes();
            String hash = java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
            String name = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename().replaceAll("[\\\\/]", "_");
            String extractedText = "";
            try {
                extractedText = tika.parseToString(new ByteArrayInputStream(bytes));
                if (extractedText == null) extractedText = "";
            } catch (Exception ignored) {}
            Document doc = documents.save(new Document(UUID.randomUUID(), tenant, name,
                    file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType(),
                    file.getSize(), "MARKETING_ASSET", safeFolder(folder) + "/" + type, auth.getToken().getClaimAsString("email"), hash,
                    extractedText, Map.of(), Map.of(), java.math.BigDecimal.ZERO, "STORED", null));
            contents.save(new com.example.agentic_ai_platform.documents.entity.DocumentContent(doc.getId(), bytes));
            return MarketingAssetResponse.from(doc);
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store marketing asset"); }
    }

    @PostMapping("/bulk") @ResponseStatus(HttpStatus.CREATED)
    public List<MarketingAssetResponse> uploadBulk(@RequestParam("files") List<MultipartFile> files,
            @RequestParam String type, @RequestParam(defaultValue = "General") String folder, JwtAuthenticationToken auth) {
        if (files == null || files.isEmpty() || files.size() > 50) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select 1 to 50 files");
        List<MarketingAssetResponse> result = new ArrayList<>();
        for (MultipartFile file : files) result.add(upload(file, type, folder, auth));
        return result;
    }

    @GetMapping("/{id}") public MarketingAssetResponse get(@PathVariable UUID id, JwtAuthenticationToken auth) {
        return MarketingAssetResponse.from(asset(auth, id));
    }

    @PutMapping("/{id}") public MarketingAssetResponse update(@PathVariable UUID id, @RequestParam String type,
            JwtAuthenticationToken auth) {
        if (!type.equals("BROCHURE") && !type.equals("CATALOG")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be BROCHURE or CATALOG");
        Document old = asset(auth, id);
        String folder = MarketingAssetResponse.from(old).folder();
        Document updated = documents.save(new Document(old.getId(), old.getTenantId(), old.getOriginalFilename(), old.getContentType(), old.getFileSize(), old.getDocumentType(), folder + "/" + type, old.getUploadedBy(), old.getContentSha256(), old.getExtractedText(), old.getExtractedFields(), old.getFieldConfidences(), old.getOverallConfidence(), old.getStatus(), old.getFlagReason()));
        return MarketingAssetResponse.from(updated);
    }

    @GetMapping("/{id}/content") public ResponseEntity<byte[]> content(@PathVariable UUID id,
            @RequestParam(defaultValue="false") boolean download, JwtAuthenticationToken auth) {
        Document doc = asset(auth, id);
        var content = contents.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var disposition = ContentDisposition.builder(download ? "attachment" : "inline").filename(doc.getOriginalFilename(), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(doc.getContentType())).contentLength(doc.getFileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString()).header("X-Content-Type-Options", "nosniff").body(content.getContent());
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id, JwtAuthenticationToken auth) {
        documents.delete(asset(auth, id));
    }

    private Document asset(JwtAuthenticationToken auth, UUID id) {
        return documents.findById(id).filter(d -> d.getTenantId().equals(tenant(auth)) && isAsset(d))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Marketing asset not found"));
    }
    private static boolean isAsset(Document d) { return "MARKETING_ASSET".equals(d.getDocumentType()); }
    private String safeFolder(String folder) {
        if (folder == null || folder.isBlank()) return "General";
        String safe = folder.trim().replaceAll("[\\\\/]", "_");
        if (safe.length() > 100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder name is too long");
        return safe;
    }
    private UUID tenant(JwtAuthenticationToken auth) {
        try { return UUID.fromString(auth.getToken().getClaimAsString("tenant_id")); }
        catch (RuntimeException e) { throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim"); }
    }
}
