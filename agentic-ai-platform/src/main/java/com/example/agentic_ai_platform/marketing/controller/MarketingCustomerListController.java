package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.dto.CustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.CustomerListResponse;
import com.example.agentic_ai_platform.marketing.dto.AiCustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.MarketingContactResponse;
import com.example.agentic_ai_platform.marketing.service.MarketingCustomerListService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/customer-lists")
public class MarketingCustomerListController {
    private final MarketingCustomerListService customerLists;

    public MarketingCustomerListController(MarketingCustomerListService customerLists) {
        this.customerLists = customerLists;
    }

    @GetMapping
    public List<CustomerListResponse> list(JwtAuthenticationToken auth) {
        return customerLists.list(tenantId(auth));
    }

    @GetMapping("/{id}")
    public CustomerListResponse get(@PathVariable UUID id, JwtAuthenticationToken auth) {
        return customerLists.get(tenantId(auth), id);
    }

    @GetMapping("/{id}/contacts")
    public List<MarketingContactResponse> members(@PathVariable UUID id, JwtAuthenticationToken auth) {
        return customerLists.members(tenantId(auth), id);
    }

    @PostMapping("/ai-generate")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerListResponse generate(@Valid @RequestBody AiCustomerListRequest request, JwtAuthenticationToken auth) {
        return customerLists.generate(tenantId(auth), request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerListResponse create(@Valid @RequestBody CustomerListRequest request, JwtAuthenticationToken auth) {
        return customerLists.create(tenantId(auth), request);
    }

    @PutMapping("/{id}")
    public CustomerListResponse update(@PathVariable UUID id, @Valid @RequestBody CustomerListRequest request,
            JwtAuthenticationToken auth) {
        return customerLists.update(tenantId(auth), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, JwtAuthenticationToken auth) {
        customerLists.delete(tenantId(auth), id);
    }

    private UUID tenantId(JwtAuthenticationToken auth) {
        try {
            return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }
    }
}
