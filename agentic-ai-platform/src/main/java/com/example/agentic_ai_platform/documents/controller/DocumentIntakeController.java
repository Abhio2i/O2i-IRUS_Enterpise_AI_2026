package com.example.agentic_ai_platform.documents.controller;

import com.example.agentic_ai_platform.documents.service.DocumentIntakeService;
import com.example.agentic_ai_platform.documents.dto.DocumentResponse;
import com.example.agentic_ai_platform.documents.dto.DocumentFileResponse;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentIntakeController {
    private final DocumentIntakeService intake;
    public DocumentIntakeController(DocumentIntakeService intake){this.intake=intake;}

    @PostMapping("/intake")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse ingest(@RequestParam MultipartFile file, @RequestParam String documentType,
                           @RequestParam(defaultValue="Direct Upload") String source, JwtAuthenticationToken auth) {
        UUID tenant=tenant(auth);
        return intake.ingest(tenant, auth.getToken().getClaimAsString("email"), file, documentType, source);
    }
    @GetMapping
    public java.util.List<DocumentResponse> list(JwtAuthenticationToken auth){return intake.list(tenant(auth));}
    @GetMapping("/{id}")
    public DocumentResponse get(@PathVariable UUID id, JwtAuthenticationToken auth){return intake.get(tenant(auth), id);}
    @GetMapping("/{id}/content")
    public ResponseEntity<byte[]> content(@PathVariable UUID id, JwtAuthenticationToken auth) {
        DocumentFileResponse file = intake.getOriginalFile(tenant(auth), id);
        MediaType contentType = MediaType.parseMediaType(file.contentType());
        boolean previewable = contentType.equals(MediaType.APPLICATION_PDF)
                || contentType.equals(MediaType.IMAGE_PNG)
                || contentType.equals(MediaType.IMAGE_JPEG)
                || contentType.equals(MediaType.IMAGE_GIF)
                || contentType.equals(MediaType.valueOf("image/webp"))
                || contentType.equals(MediaType.TEXT_PLAIN)
                || contentType.equals(MediaType.TEXT_MARKDOWN);
        ContentDisposition disposition = ContentDisposition.builder(previewable ? "inline" : "attachment")
                .filename(file.name(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(contentType)
                .contentLength(file.content().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(file.content());
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, JwtAuthenticationToken auth) {
        intake.delete(tenant(auth), id);
    }
    private UUID tenant(JwtAuthenticationToken auth){try{return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));}catch(Exception e){throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Token has no valid tenant_id claim");}}
}
