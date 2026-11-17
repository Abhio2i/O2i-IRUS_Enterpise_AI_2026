package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.documents.entity.Document;
import com.example.agentic_ai_platform.documents.repository.DocumentContentRepository;
import com.example.agentic_ai_platform.documents.repository.DocumentRepository;
import com.example.agentic_ai_platform.marketing.serviceimpl.GroqContentGenerator;
import java.io.ByteArrayInputStream;
import java.util.Map;
import java.util.UUID;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/content")
public class MarketingContentController {
    private static final Logger log = LoggerFactory.getLogger(MarketingContentController.class);

    private final GroqContentGenerator generator;
    private final DocumentRepository documents;
    private final DocumentContentRepository contents;
    private final Tika tika = new Tika();

    public MarketingContentController(GroqContentGenerator generator, DocumentRepository documents, DocumentContentRepository contents) {
        this.generator = generator;
        this.documents = documents;
        this.contents = contents;
    }

    public record GenerateRequest(
            String targetDomain,
            String industry,
            String tone,
            String topic,
            String callToAction,
            String prompt,
            String sourceAssetId
    ) {}

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody GenerateRequest request, JwtAuthenticationToken auth) {
        if (request.sourceAssetId() == null || request.sourceAssetId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a brochure or catalog as the email source");
        }
        UUID tenant;
        try {
            tenant = UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }

        UUID assetUuid;
        try {
            assetUuid = UUID.fromString(request.sourceAssetId().trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sourceAssetId format");
        }

        Document asset = documents.findById(assetUuid)
                .filter(d -> d.getTenantId().equals(tenant) && "MARKETING_ASSET".equals(d.getDocumentType())
                        && (d.getSource().endsWith("/BROCHURE") || d.getSource().endsWith("/CATALOG")))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Selected brochure or catalog not found for current tenant"));

        String sourceText = asset.getExtractedText();
        // If extractedText is empty, lazily extract from stored raw content bytes
        if ((sourceText == null || sourceText.isBlank()) && contents != null) {
            var rawContent = contents.findById(asset.getId());
            if (rawContent.isPresent() && rawContent.get().getContent() != null && rawContent.get().getContent().length > 0) {
                try {
                    sourceText = tika.parseToString(new ByteArrayInputStream(rawContent.get().getContent()));
                    if (sourceText != null && !sourceText.isBlank()) {
                        Document updated = new Document(asset.getId(), asset.getTenantId(), asset.getOriginalFilename(),
                                asset.getContentType(), asset.getFileSize(), asset.getDocumentType(), asset.getSource(),
                                asset.getUploadedBy(), asset.getContentSha256(), sourceText, asset.getExtractedFields(),
                                asset.getFieldConfidences(), asset.getOverallConfidence(), asset.getStatus(), asset.getFlagReason());
                        documents.save(updated);
                        log.info("Lazily extracted {} chars of text from brochure/catalog asset {}", sourceText.length(), asset.getId());
                    }
                } catch (Exception ex) {
                    log.warn("Failed to lazily extract text from asset {}: {}", asset.getId(), ex.getMessage());
                }
            }
        }

        if (sourceText == null || sourceText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Selected brochure/catalog has no extractable text. Upload a text-based PDF or document.");
        }

        var generated = generator.generate(
                request.targetDomain(),
                request.industry(),
                request.tone(),
                request.topic(),
                request.callToAction(),
                request.prompt(),
                sourceText
        );

        return ResponseEntity.ok(Map.of(
                "targetDomain", request.targetDomain() != null ? request.targetDomain() : "",
                "industry", request.industry() != null ? request.industry() : "",
                "tone", request.tone() != null ? request.tone() : "",
                "topic", request.topic() != null ? request.topic() : "",
                "callToAction", request.callToAction() != null ? request.callToAction() : "",
                "subject", generated.subject(),
                "subjectLine", generated.subject(),
                "contentHtml", generated.contentHtml(),
                "contentText", generated.contentText()
        ));
    }
}
