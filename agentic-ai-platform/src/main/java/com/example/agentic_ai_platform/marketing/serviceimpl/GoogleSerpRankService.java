package com.example.agentic_ai_platform.marketing.serviceimpl;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GoogleSerpRankService {

    private static final Logger log = LoggerFactory.getLogger(GoogleSerpRankService.class);
    private final String serpApiKey;
    private final String engine;
    private final String country;
    private final String language;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GoogleSerpRankService(
            @Value("${app.seo.serpapi-key:}") String serpApiKey,
            @Value("${app.seo.serpapi-engine:google}") String engine,
            @Value("${app.seo.serpapi-gl:us}") String country,
            @Value("${app.seo.serpapi-hl:en}") String language,
            ObjectMapper objectMapper) {
        this.serpApiKey = serpApiKey != null ? serpApiKey.trim() : "";
        this.engine = engine != null && !engine.isBlank() ? engine : "google";
        this.country = country != null && !country.isBlank() ? country : "us";
        this.language = language != null && !language.isBlank() ? language : "en";
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isLiveProviderConfigured() {
        return !serpApiKey.isBlank();
    }

    public String getProviderName() {
        return isLiveProviderConfigured() ? "SerpApi Google Search Engine (Live)" : "Demo Simulation Engine";
    }

    /**
     * Query live Google search engine via SerpApi and find ranking position of targetUrlOrDomain.
     */
    public Optional<Integer> fetchRealGoogleRank(String keyword, String targetUrlOrDomain) {
        if (!isLiveProviderConfigured()) {
            return Optional.empty();
        }

        try {
            String domainNeedle = extractDomainOrPath(targetUrlOrDomain);
            if (domainNeedle.isBlank()) {
                return Optional.empty();
            }

            String url = String.format(
                    "https://serpapi.com/search.json?engine=%s&q=%s&gl=%s&hl=%s&num=100&api_key=%s",
                    URLEncoder.encode(engine, StandardCharsets.UTF_8),
                    URLEncoder.encode(keyword, StandardCharsets.UTF_8),
                    URLEncoder.encode(country, StandardCharsets.UTF_8),
                    URLEncoder.encode(language, StandardCharsets.UTF_8),
                    URLEncoder.encode(serpApiKey, StandardCharsets.UTF_8)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("SerpApi returned non-200 status: {} - {}", response.statusCode(), response.body());
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode organic = root.path("organic_results");

            if (organic.isArray()) {
                for (JsonNode item : organic) {
                    int pos = item.path("position").asInt(0);
                    String link = item.path("link").asText("").toLowerCase();
                    String displayedLink = item.path("displayed_link").asText("").toLowerCase();
                    String source = item.path("source").asText("").toLowerCase();

                    if (pos > 0 && (displayedLink.contains(domainNeedle) || source.contains(domainNeedle) || link.contains(domainNeedle))) {
                        log.info("Found real Google SERP rank #{} for '{}' matching '{}'", pos, keyword, domainNeedle);
                        return Optional.of(pos);
                    }
                }
            }

            // Keyword is tracked, but not ranking in the top 100 organic search results
            log.info("Keyword '{}' not found in top 100 for '{}'", keyword, domainNeedle);
            return Optional.of(101);

        } catch (Exception e) {
            log.error("Failed to fetch real Google rank for keyword '{}': {}", keyword, e.getMessage());
            return Optional.empty();
        }
    }

    private String extractDomainOrPath(String urlOrDomain) {
        if (urlOrDomain == null || urlOrDomain.isBlank()) return "";
        String clean = urlOrDomain.toLowerCase().trim();
        clean = clean.replaceFirst("^https?://", "");
        clean = clean.replaceFirst("^www\\.", "");
        clean = clean.replaceFirst("/$", "");
        return clean;
    }
}
