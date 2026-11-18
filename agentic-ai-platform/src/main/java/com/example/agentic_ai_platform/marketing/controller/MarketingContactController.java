package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.dto.ContactImportResponse;
import com.example.agentic_ai_platform.marketing.dto.MarketingContactResponse;
import com.example.agentic_ai_platform.marketing.service.MarketingCustomerListService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/contacts")
public class MarketingContactController {
    private final MarketingCustomerListService customerLists;

    public MarketingContactController(MarketingCustomerListService customerLists) {
        this.customerLists = customerLists;
    }

    @GetMapping
    public List<MarketingContactResponse> list(
            @RequestParam(name = "domain", required = false) String domain,
            JwtAuthenticationToken auth) {
        List<MarketingContactResponse> contacts = customerLists.contacts(tenantId(auth));
        if (domain != null && !domain.isBlank()) {
            String d = domain.trim().toLowerCase();
            return contacts.stream()
                    .filter(c -> (c.email() != null && c.email().toLowerCase().contains(d))
                            || (c.company() != null && c.company().toLowerCase().contains(d)))
                    .toList();
        }
        return contacts;
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactImportResponse importContacts(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderName", required = false) String folderName,
            @RequestParam(value = "targetListId", required = false) UUID targetListId,
            JwtAuthenticationToken auth) {
        return customerLists.importContacts(tenantId(auth), file, folderName, targetListId);
    }

    @org.springframework.web.bind.annotation.DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAllContacts(JwtAuthenticationToken auth) {
        customerLists.deleteAllContacts(tenantId(auth));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContact(@PathVariable UUID id, JwtAuthenticationToken auth) {
        customerLists.deleteContact(tenantId(auth), id);
    }

    private UUID tenantId(JwtAuthenticationToken auth) {
        try {
            return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }
    }
}
