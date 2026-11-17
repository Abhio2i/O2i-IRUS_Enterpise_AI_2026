package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.dto.*;
import com.example.agentic_ai_platform.marketing.entity.SeoKeyword;
import com.example.agentic_ai_platform.marketing.repository.SeoKeywordRepository;
import com.example.agentic_ai_platform.marketing.serviceimpl.GoogleSerpRankService;
import com.example.agentic_ai_platform.marketing.serviceimpl.GroqContentGenerator;
import jakarta.validation.Valid;
import java.util.*;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/marketing/seo")
public class SeoKeywordController {

    private final SeoKeywordRepository repo;
    private final GroqContentGenerator groq;
    private final GoogleSerpRankService serpRankService;

    public SeoKeywordController(
            SeoKeywordRepository repo,
            GroqContentGenerator groq,
            GoogleSerpRankService serpRankService) {
        this.repo = repo;
        this.groq = groq;
        this.serpRankService = serpRankService;
    }

    @GetMapping("/config")
    public Map<String, Object> getConfig(JwtAuthenticationToken auth) {
        return Map.of(
                "liveProviderConfigured", serpRankService.isLiveProviderConfigured(),
                "provider", serpRankService.getProviderName(),
                "note", serpRankService.isLiveProviderConfigured()
                        ? "Connected to Live Google Search Engine via SerpApi."
                        : "Set SERPAPI_API_KEY in backend .env to enable live Google SERP ranking."
        );
    }

    @GetMapping("/keywords")
    public List<SeoKeywordResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer maxDifficulty,
            JwtAuthenticationToken auth) {
        String query = q == null ? "" : q.toLowerCase(Locale.ROOT);
        return repo.findAllByTenantIdOrderByKeywordAsc(tenant(auth)).stream()
                .filter(k -> query.isBlank() || k.getKeyword().toLowerCase(Locale.ROOT).contains(query))
                .filter(k -> maxDifficulty == null || k.getDifficulty() == null || k.getDifficulty() <= maxDifficulty)
                .map(SeoKeywordResponse::from)
                .toList();
    }

    @PostMapping("/keywords")
    @ResponseStatus(HttpStatus.CREATED)
    public SeoKeywordResponse create(@Valid @RequestBody SeoKeywordRequest req, JwtAuthenticationToken auth) {
        SeoKeyword keyword = new SeoKeyword(UUID.randomUUID(), tenant(auth), req);
        if (serpRankService.isLiveProviderConfigured()) {
            Optional<Integer> realRank = serpRankService.fetchRealGoogleRank(keyword.getKeyword(), keyword.getTargetPage());
            if (realRank.isPresent()) {
                keyword.updateRank(realRank.get());
            }
        }
        return SeoKeywordResponse.from(repo.save(keyword));
    }

    @DeleteMapping("/keywords/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, JwtAuthenticationToken auth) {
        repo.delete(find(tenant(auth), id));
    }

    @PostMapping("/keywords/{id}/optimize")
    public SeoOptimizationResponse optimize(@PathVariable UUID id, JwtAuthenticationToken auth) {
        SeoKeyword k = find(tenant(auth), id);
        if (serpRankService.isLiveProviderConfigured()) {
            Optional<Integer> realRank = serpRankService.fetchRealGoogleRank(k.getKeyword(), k.getTargetPage());
            if (realRank.isPresent()) {
                k.updateRank(realRank.get());
            }
        }
        String prompt = "Keyword: " + k.getKeyword()
                + "\nTarget page: " + Objects.toString(k.getTargetPage(), "not provided")
                + "\nIntent: " + k.getIntent()
                + "\nReturn JSON keys metaTitle (max 60 chars), metaDescription (max 155 chars), headings (array of 3 H2 suggestions), recommendations (array of 3 actionable SEO recommendations). Do not claim measured ranking or traffic.";
        JsonNode n = groq.generateStructuredJson(
                "You are a careful SEO content strategist. Return valid JSON only and avoid unsupported factual claims.",
                prompt);
        String title = n.path("metaTitle").asText("").trim();
        String description = n.path("metaDescription").asText("").trim();
        if (title.isBlank() || description.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq response is missing required SEO fields");
        }
        List<String> headings = strings(n.path("headings"));
        List<String> recommendations = strings(n.path("recommendations"));
        k.optimize(title, description, String.join("; ", recommendations));
        repo.save(k);
        return new SeoOptimizationResponse(title, description, headings, recommendations);
    }

    @PostMapping("/keywords/{id}/check-rank")
    public Map<String, Object> checkRank(@PathVariable UUID id, JwtAuthenticationToken auth) {
        SeoKeyword k = find(tenant(auth), id);
        boolean live = serpRankService.isLiveProviderConfigured();
        if (live) {
            Optional<Integer> realRank = serpRankService.fetchRealGoogleRank(k.getKeyword(), k.getTargetPage());
            if (realRank.isPresent()) {
                k.updateRank(realRank.get());
                repo.save(k);
                return Map.of("mode", "LIVE_GOOGLE_SERP", "keyword", k.getKeyword(), "rank", realRank.get(), "response", SeoKeywordResponse.from(k));
            }
        }
        k.updateRank(101);
        repo.save(k);
        return Map.of("mode", "LIVE_GOOGLE_SERP", "keyword", k.getKeyword(), "rank", 101, "response", SeoKeywordResponse.from(k));
    }

    @PostMapping("/sweep")
    public Map<String, Object> sweep(JwtAuthenticationToken auth) {
        List<SeoKeyword> keywords = repo.findAllByTenantIdOrderByKeywordAsc(tenant(auth));
        boolean live = serpRankService.isLiveProviderConfigured();
        int realMatchedCount = 0;

        for (SeoKeyword k : keywords) {
            if (live) {
                Optional<Integer> realRank = serpRankService.fetchRealGoogleRank(k.getKeyword(), k.getTargetPage());
                if (realRank.isPresent()) {
                    k.updateRank(realRank.get());
                    realMatchedCount++;
                } else {
                    k.updateRank(101);
                }
            }
        }
        repo.saveAll(keywords);

        return Map.of(
                "mode", live ? "LIVE_GOOGLE_SERP" : "NO_PROVIDER",
                "provider", serpRankService.getProviderName(),
                "source", live ? "Live Google Search Engine via SerpApi" : "not configured",
                "updatedCount", keywords.size(),
                "liveGoogleRankCount", realMatchedCount,
                "keywords", keywords.stream().map(SeoKeywordResponse::from).toList()
        );
    }

    private static List<String> strings(JsonNode n) {
        List<String> out = new ArrayList<>();
        if (n.isArray()) {
            for (JsonNode v : n) {
                if (v.isString()) out.add(v.asText());
            }
        }
        return out;
    }

    private SeoKeyword find(UUID tenant, UUID id) {
        return repo.findByTenantIdAndId(tenant, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SEO keyword not found"));
    }

    private static UUID tenant(JwtAuthenticationToken a) {
        try {
            return UUID.fromString(a.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }
    }
}
