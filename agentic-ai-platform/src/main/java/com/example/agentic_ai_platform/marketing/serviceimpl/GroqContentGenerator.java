package com.example.agentic_ai_platform.marketing.serviceimpl;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class GroqContentGenerator {
    private static final Logger log = LoggerFactory.getLogger(GroqContentGenerator.class);

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public record GeneratedContent(String subject, String contentHtml, String contentText) {}

    /** Generate arbitrary JSON content (for example, proposal sections) without applying the email schema. */
    public JsonNode generateStructuredJson(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq provider is not configured. Please set GROQ_API_KEY.");
        }
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("temperature", 0.1);
            body.putObject("response_format").put("type", "json_object");
            ArrayNode messages = body.putArray("messages");
            messages.addObject().put("role", "system").put("content", systemPrompt);
            messages.addObject().put("role", "user").put("content", userPrompt);
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(60))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body))).build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String detail = response.body();
                try { detail = objectMapper.readTree(detail).path("error").path("message").asText(detail); } catch (Exception ignored) {}
                log.error("Groq structured generation failed ({}): {}", response.statusCode(), detail);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq proposal generation failed (" + response.statusCode() + "): " + detail);
            }
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choice = root.path("choices").path(0);
            String content = choice.path("message").path("content").asText("").trim();
            if (content.isBlank()) {
                log.warn("Groq returned blank structured content; finish_reason={}", choice.path("finish_reason").asText("unknown"));
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned an empty proposal. Please retry.");
            }
            // Strip reasoning blocks or markdown code fences if present
            content = content.replaceAll("(?s)<think>.*?</think>", "").trim();
            content = content.replaceAll("(?s)^```(?:json)?\\s*", "").replaceAll("(?s)\\s*```$", "").trim();
            int firstBrace = content.indexOf('{');
            int lastBrace = content.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                content = content.substring(firstBrace, lastBrace + 1);
            }
            JsonNode parsed = objectMapper.readTree(content);
            if (!parsed.isObject() || parsed.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned an invalid proposal schema. Please retry.");
            }
            return parsed;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq proposal generation was interrupted");
        } catch (Exception e) {
            log.error("Groq structured proposal generation failed", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned invalid JSON for the proposal. Please retry.");
        }
    }

    public GroqContentGenerator(ObjectMapper objectMapper,
            @Value("${app.ai.groq-api-key:}") String apiKey,
            @Value("${app.ai.groq-model:openai/gpt-oss-120b}") String model,
            @Value("${app.ai.groq-base-url:https://api.groq.com/openai/v1}") String baseUrl) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    public GeneratedContent generate(String domain, String industry, String tone, String topic, String callToAction) {
        return generate(domain, industry, tone, topic, callToAction, null, null);
    }

    public GeneratedContent generate(String domain, String industry, String tone, String topic, String callToAction, String prompt) {
        return generate(domain, industry, tone, topic, callToAction, prompt, null);
    }

    public GeneratedContent generate(String domain, String industry, String tone, String topic, String callToAction, String prompt, String sourceText) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Groq provider is not configured. Please set GROQ_API_KEY.");
        }

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("temperature", 0.7);
            requestBody.putObject("response_format").put("type", "json_object");
            ArrayNode messages = requestBody.putArray("messages");
            messages.addObject().put("role", "system").put("content",
                    "You are an expert Fortune 500 B2B enterprise copywriter representing Oxygen to Innovation. "
                    + "Write a concise, compelling outreach email strictly grounded only in the supplied brochure/catalog source. "
                    + "Do not invent features, outcomes, prices, claims, capabilities, or offers not present in the source text. "
                    + "Use {{firstName}} (or {{firstName}} {{lastName}}) in the greeting, {{company}} only where natural, and {{senderName}} in the sign-off. "
                    + "The subject must also be engaging and personalized where natural using {{firstName}} or {{company}}. "
                    + "Return a JSON object with keys: 'subject', 'contentHtml', and 'contentText'.");

            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("Target Domain: ").append(domain != null && !domain.isBlank() ? domain : "Enterprise").append("\n");
            userPrompt.append("Industry: ").append(industry != null && !industry.isBlank() ? industry : "Technology").append("\n");
            userPrompt.append("Tone: ").append(tone != null && !tone.isBlank() ? tone : "EXECUTIVE").append("\n");
            userPrompt.append("Topic: ").append(topic != null && !topic.isBlank() ? topic : "ERP Modernisation & AI Supply Chain Integration").append("\n");
            userPrompt.append("Call to Action: ").append(callToAction != null && !callToAction.isBlank() ? callToAction : "Schedule a 15-Minute Architecture Review").append("\n");
            if (prompt != null && !prompt.isBlank()) {
                userPrompt.append("Custom Instructions / Key Angle: ").append(prompt.trim()).append("\n");
            }
            if (sourceText == null || sourceText.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Brochure/catalog source text is required");
            }
            String boundedSource = sourceText.length() > 18000 ? sourceText.substring(0, 18000) : sourceText;
            userPrompt.append("\nBROCHURE/CATALOG SOURCE (use as the only factual source):\n<<<\n")
                    .append(boundedSource).append("\n>>>\n");

            messages.addObject().put("role", "user").put("content", userPrompt.toString());

            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                String contentStr = root.path("choices").path(0).path("message").path("content").asText();
                JsonNode parsed = objectMapper.readTree(contentStr);
                String subject = parsed.path("subject").asText();
                String html = parsed.path("contentHtml").asText();
                String text = parsed.path("contentText").asText();
                if (!subject.isBlank() && (!html.isBlank() || !text.isBlank())) {
                    return new GeneratedContent(
                            subject,
                            !html.isBlank() ? html : "<p>" + text.replace("\n", "<br/>") + "</p>",
                            !text.isBlank() ? text : html.replaceAll("<[^>]*>", "")
                    );
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq provider returned an empty or invalid content schema");
            } else {
                String errorDetail = response.body();
                try {
                    JsonNode errNode = objectMapper.readTree(response.body());
                    if (errNode.has("error") && errNode.get("error").has("message")) {
                        errorDetail = errNode.get("error").get("message").asText();
                    }
                } catch (Exception ignored) {}
                log.error("Groq API email generation error (status {}): {}", response.statusCode(), response.body());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq email generation failed (" + response.statusCode() + "): " + errorDetail);
            }
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq provider request was interrupted");
        } catch (Exception exception) {
            log.error("Groq email draft generation failed", exception);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq email draft generation failed: " + exception.getMessage());
        }
    }
}
