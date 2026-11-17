package com.example.agentic_ai_platform;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.agentic_ai_platform.marketing.dto.AiCustomerListRequest;
import com.example.agentic_ai_platform.marketing.dto.ContactImportResponse;
import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import com.example.agentic_ai_platform.marketing.entity.MarketingCustomerList;
import com.example.agentic_ai_platform.marketing.repository.MarketingContactRepository;
import com.example.agentic_ai_platform.marketing.repository.MarketingCustomerListRepository;
import com.example.agentic_ai_platform.marketing.serviceimpl.MarketingCustomerListServiceImpl;
import com.example.agentic_ai_platform.marketing.serviceimpl.GroqContactSelector;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

class MarketingCustomerListServiceTests {
    private MarketingCustomerListRepository lists;
    private MarketingContactRepository contacts;
    private GroqContactSelector selector;
    private MarketingCustomerListServiceImpl service;

    @BeforeEach
    void setUp() {
        lists = org.mockito.Mockito.mock(MarketingCustomerListRepository.class);
        contacts = org.mockito.Mockito.mock(MarketingContactRepository.class);
        selector = org.mockito.Mockito.mock(GroqContactSelector.class);
        service = new MarketingCustomerListServiceImpl(lists, contacts, selector, 5_242_880, 2_000, 2_000);
    }

    @Test
    void importsQuotedCsvRowsAndDeduplicatesWithinTenant() {
        UUID tenantId = UUID.randomUUID();
        when(contacts.findAllByTenantIdOrderByCreatedAtDesc(tenantId)).thenReturn(List.of());
        String csv = "email,firstName,company,annualRevenue,churnProbability\n"
                + "\"ALICE@example.com\",\"Alice\",\"Widgets, Inc\",120.25,10\n"
                + "alice@example.com,Alicia,Another Co,50,5\n"
                + "not-an-email,Bad,Company,10,101\n";
        MockMultipartFile file = new MockMultipartFile("file", "contacts.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));

        ContactImportResponse result = service.importContacts(tenantId, file);

        assertEquals(1, result.imported());
        assertEquals(1, result.duplicates());
        assertEquals(1, result.invalid());
        assertEquals(3, result.processed());
        assertEquals(1, result.errors().size());
        verify(contacts).saveAll(anyList());
    }

    @Test
    void rejectsAiSelectionsOutsideTenantDataset() {
        UUID tenantId = UUID.randomUUID();
        MarketingContact tenantContact = contact(tenantId);
        UUID foreignId = UUID.randomUUID();
        when(contacts.findAllByTenantIdOrderByCreatedAtDesc(tenantId)).thenReturn(List.of(tenantContact));
        when(selector.select(eq("active customers"), any())).thenReturn(List.of(foreignId));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.generate(tenantId, new AiCustomerListRequest("active customers", null)));

        assertEquals(502, exception.getStatusCode().value());
        verify(lists, never()).save(any(MarketingCustomerList.class));
    }

    @Test
    void createsAiListsWithOnlySelectedMembersAndZeroConversionRate() {
        UUID tenantId = UUID.randomUUID();
        MarketingContact tenantContact = contact(tenantId);
        when(contacts.findAllByTenantIdOrderByCreatedAtDesc(tenantId)).thenReturn(List.of(tenantContact));
        when(selector.select(eq("active customers"), any())).thenReturn(List.of(tenantContact.getId()));
        when(lists.save(any(MarketingCustomerList.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.generate(tenantId, new AiCustomerListRequest("active customers", "Saved selection"));

        assertEquals("Saved selection", result.name());
        assertEquals(1, result.contacts());
        assertEquals(BigDecimal.ZERO.setScale(2), result.conversionRate());
        assertEquals(true, result.aiGenerated());
        verify(selector).select(eq("active customers"), eq(List.of(tenantContact)));
    }

    private MarketingContact contact(UUID tenantId) {
        return new MarketingContact(UUID.randomUUID(), tenantId, "private@example.com", "Private", "Name",
                "Example Co", "Director", "Technology", "Canada", BigDecimal.valueOf(500_000),
                "ACTIVE", BigDecimal.TEN);
    }
}
