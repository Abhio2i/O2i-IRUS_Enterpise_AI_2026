package com.example.agentic_ai_platform.marketing.service;

import com.example.agentic_ai_platform.marketing.dto.CustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.CustomerListResponse;
import com.example.agentic_ai_platform.marketing.dto.AiCustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.ContactImportResponse;
import com.example.agentic_ai_platform.marketing.dto.MarketingContactResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface MarketingCustomerListService {
    List<CustomerListResponse> list(UUID tenantId);
    CustomerListResponse get(UUID tenantId, UUID id);
    CustomerListResponse create(UUID tenantId, CustomerListRequest request);
    CustomerListResponse update(UUID tenantId, UUID id, CustomerListRequest request);
    void delete(UUID tenantId, UUID id);
    List<MarketingContactResponse> contacts(UUID tenantId);
    ContactImportResponse importContacts(UUID tenantId, MultipartFile file, String folderName, UUID targetListId);
    default ContactImportResponse importContacts(UUID tenantId, MultipartFile file) {
        return importContacts(tenantId, file, null, null);
    }
    void deleteAllContacts(UUID tenantId);
    void deleteContact(UUID tenantId, UUID contactId);
    CustomerListResponse generate(UUID tenantId, AiCustomerListRequest request);
    List<MarketingContactResponse> members(UUID tenantId, UUID listId);
}
