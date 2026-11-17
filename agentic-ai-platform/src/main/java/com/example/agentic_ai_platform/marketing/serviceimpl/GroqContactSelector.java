package com.example.agentic_ai_platform.marketing.serviceimpl;

import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class GroqContactSelector {
    private static final Logger log = LoggerFactory.getLogger(GroqContactSelector.class);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public GroqContactSelector(ObjectMapper objectMapper,
            @Value("${app.ai.groq-api-key:}") String apiKey,
            @Value("${app.ai.groq-model:openai/gpt-oss-120b}") String model,
            @Value("${app.ai.groq-base-url:https://api.groq.com/openai/v1}") String baseUrl) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    public List<UUID> select(String prompt, List<MarketingContact> contacts) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq provider is not configured");
        }
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("temperature", 0);
            requestBody.putObject("response_format").put("type", "json_object");
            ArrayNode messages = requestBody.putArray("messages");
            messages.addObject().put("role", "system").put("content",
                    "Select only the supplied contact IDs that match the user's audience criteria. "
                    + "Do not infer missing facts, create prospects, or return contact attributes. "
                    + "Return exactly one JSON object with one property named contactIds, an array of supplied ID strings.");
            ObjectNode userContent = objectMapper.createObjectNode();
            userContent.put("selectionPrompt", prompt);
            ArrayNode candidates = userContent.putArray("contacts");
            for (MarketingContact contact : contacts) {
                ObjectNode candidate = candidates.addObject();
                candidate.put("id", contact.getId().toString());
                candidate.put("email", contact.getEmail());
                putIfPresent(candidate, "firstName", contact.getFirstName());
                putIfPresent(candidate, "lastName", contact.getLastName());
                putIfPresent(candidate, "company", contact.getCompany());
                putIfPresent(candidate, "title", contact.getTitle());
                putIfPresent(candidate, "industry", contact.getIndustry());
                putIfPresent(candidate, "country", contact.getCountry());
                if (contact.getAnnualRevenue() != null) {
                    candidate.put("annualRevenue", contact.getAnnualRevenue());
                }
                putIfPresent(candidate, "customerStatus", contact.getCustomerStatus());
                if (contact.getChurnProbability() != null) {
                    candidate.put("churnProbability", contact.getChurnProbability());
                }
            }
            // OpenAI/Groq API requires content to be a string
            messages.addObject().put("role", "user").put("content", objectMapper.writeValueAsString(userContent));
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String errorDetail = response.body();
                try {
                    JsonNode errNode = objectMapper.readTree(response.body());
                    if (errNode.has("error") && errNode.get("error").has("message")) {
                        errorDetail = errNode.get("error").get("message").asText();
                    }
                } catch (Exception ignored) {}
                log.error("Groq API error (status {}): {}", response.statusCode(), response.body());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq provider request failed (" + response.statusCode() + "): " + errorDetail);
            }
            return parseSelection(response.body(), contacts);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq provider request was interrupted");
        } catch (Exception exception) {
            log.error("Groq provider processing failed", exception);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq provider returned an invalid response: " + exception.getMessage());
        }
    }

    private List<UUID> parseSelection(String body, List<MarketingContact> contacts) throws Exception {
        JsonNode response = objectMapper.readTree(body);
        JsonNode content = response.path("choices").path(0).path("message").path("content");
        if (!content.isTextual()) {
            throw new IllegalArgumentException("Missing selection content");
        }
        JsonNode result = objectMapper.readTree(content.asText());
        if (!result.isObject() || !result.has("contactIds")
                || !result.get("contactIds").isArray()) {
            throw new IllegalArgumentException("Invalid selection schema");
        }
        Set<UUID> suppliedIds = new HashSet<>();
        contacts.forEach(contact -> suppliedIds.add(contact.getId()));
        Set<UUID> selectedIds = new HashSet<>();
        List<UUID> selected = new ArrayList<>();
        for (JsonNode node : result.get("contactIds")) {
            if (!node.isTextual()) {
                throw new IllegalArgumentException("Contact IDs must be strings");
            }
            UUID id = UUID.fromString(node.asText());
            if (suppliedIds.contains(id) && selectedIds.add(id)) {
                selected.add(id);
            }
        }
        return selected;
    }

    private void putIfPresent(ObjectNode node, String key, String value) {
        if (value != null) {
            node.put(key, value);
        }
    }
}
