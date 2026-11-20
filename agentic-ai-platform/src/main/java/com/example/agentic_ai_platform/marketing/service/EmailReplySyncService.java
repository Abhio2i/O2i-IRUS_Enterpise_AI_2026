package com.example.agentic_ai_platform.marketing.service;

import com.example.agentic_ai_platform.marketing.entity.MarketingCampaignReply;
import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import com.example.agentic_ai_platform.marketing.entity.MarketingCampaignEvent;
import com.example.agentic_ai_platform.marketing.repository.MarketingCampaignEventRepository;
import com.example.agentic_ai_platform.marketing.repository.MarketingCampaignReplyRepository;
import com.example.agentic_ai_platform.marketing.repository.MarketingContactRepository;
import jakarta.mail.Address;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.InternetAddress;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailReplySyncService {
    private static final Logger log = LoggerFactory.getLogger(EmailReplySyncService.class);

    private final MarketingCampaignReplyRepository replyRepository;
    private final MarketingContactRepository contactRepository;
    private final MarketingCampaignEventRepository eventRepository;

    @Value("${app.mail.imap.host:${spring.mail.host:}}")
    private String imapHost;

    @Value("${app.mail.imap.port:993}")
    private int imapPort;

    @Value("${app.mail.imap.username:${spring.mail.username:}}")
    private String imapUsername;

    @Value("${app.mail.imap.password:${spring.mail.password:}}")
    private String imapPassword;

    @Value("${app.mail.imap.folder:INBOX}")
    private String imapFolder;

    @Value("${app.mail.imap.enabled:true}")
    private boolean imapEnabled;

    public EmailReplySyncService(MarketingCampaignReplyRepository replyRepository,
                                 MarketingContactRepository contactRepository,
                                 MarketingCampaignEventRepository eventRepository) {
        this.replyRepository = replyRepository;
        this.contactRepository = contactRepository;
        this.eventRepository = eventRepository;
    }

    public Map<String, Object> syncReplies(UUID tenantId) {
        Map<String, Object> result = new HashMap<>();
        if (!imapEnabled || imapHost == null || imapHost.isBlank() || imapUsername == null || imapUsername.isBlank()) {
            result.put("status", "DISABLED");
            result.put("message", "IMAP sync is not configured on this server");
            result.put("newReplies", 0);
            result.put("totalReplies", replyRepository.countByTenantId(tenantId));
            return result;
        }

        int newRepliesCount = 0;

        // Ensure any existing replying contacts have confirmed OPEN events
        try {
            List<MarketingCampaignReply> existingReplies = replyRepository.findAllByTenantIdOrderByReceivedAtDesc(tenantId);
            for (MarketingCampaignReply rep : existingReplies) {
                if (rep.getSenderEmail() != null && !rep.getSenderEmail().isBlank()) {
                    if (!eventRepository.existsByTenantIdAndEventTypeAndContactEmail(tenantId, "OPEN", rep.getSenderEmail())) {
                        MarketingCampaignEvent openEvent = new MarketingCampaignEvent(
                                UUID.randomUUID(),
                                tenantId,
                                rep.getCampaignId(),
                                rep.getSenderEmail(),
                                "OPEN",
                                null,
                                "IMAP-Verified",
                                "Confirmed Open via Inbound Reply"
                        );
                        eventRepository.save(openEvent);
                    }
                }
            }
        } catch (Exception backfillEx) {
            log.debug("Backfill open event note: {}", backfillEx.getMessage());
        }

        Store store = null;
        Folder folder = null;

        try {
            Properties props = new Properties();
            props.put("mail.store.protocol", "imaps");
            props.put("mail.imaps.host", imapHost);
            props.put("mail.imaps.port", String.valueOf(imapPort));
            props.put("mail.imaps.ssl.enable", "true");
            props.put("mail.imaps.timeout", "10000");
            props.put("mail.imaps.connectiontimeout", "10000");

            Session session = Session.getInstance(props);
            store = session.getStore("imaps");
            store.connect(imapHost, imapPort, imapUsername, imapPassword);

            folder = store.getFolder(imapFolder);
            folder.open(Folder.READ_ONLY);

            int totalMsgs = folder.getMessageCount();
            int startIdx = Math.max(1, totalMsgs - 100); // scan last 100 emails

            Message[] messages = folder.getMessages(startIdx, totalMsgs);

            List<MarketingContact> tenantContacts = contactRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);
            Map<String, MarketingContact> contactByEmail = new HashMap<>();
            for (MarketingContact c : tenantContacts) {
                if (c.getEmail() != null) {
                    contactByEmail.put(c.getEmail().toLowerCase(Locale.ROOT).trim(), c);
                }
            }

            for (int i = messages.length - 1; i >= 0; i--) {
                Message msg = messages[i];
                try {
                    String[] msgIdHeaders = msg.getHeader("Message-ID");
                    String rawMsgId = (msgIdHeaders != null && msgIdHeaders.length > 0) ? msgIdHeaders[0].trim() : "msg-" + msg.getMessageNumber() + "-" + msg.getSentDate().getTime();

                    if (replyRepository.existsByTenantIdAndMessageId(tenantId, rawMsgId)) {
                        continue;
                    }

                    Address[] fromAddresses = msg.getFrom();
                    if (fromAddresses == null || fromAddresses.length == 0) continue;

                    String senderEmail = "";
                    String senderName = "";
                    if (fromAddresses[0] instanceof InternetAddress ia) {
                        senderEmail = ia.getAddress() != null ? ia.getAddress().toLowerCase(Locale.ROOT).trim() : "";
                        senderName = ia.getPersonal() != null ? ia.getPersonal().trim() : "";
                    } else {
                        senderEmail = fromAddresses[0].toString().toLowerCase(Locale.ROOT).trim();
                    }

                    // Ignore outgoing emails from our own mailbox
                    if (senderEmail.equalsIgnoreCase(imapUsername) || senderEmail.contains("mailer-daemon") || senderEmail.contains("postmaster")) {
                        continue;
                    }

                    MarketingContact matchedContact = contactByEmail.get(senderEmail);
                    String schoolName = "";
                    UUID contactId = null;

                    if (matchedContact != null) {
                        contactId = matchedContact.getId();
                        schoolName = matchedContact.getCompany() != null ? matchedContact.getCompany() : "";
                        if (senderName.isBlank() && matchedContact.getFirstName() != null) {
                            senderName = (matchedContact.getFirstName() + " " + (matchedContact.getLastName() != null ? matchedContact.getLastName() : "")).trim();
                        }
                    } else {
                        // Check if domain matches any contact
                        if (senderEmail.contains("@")) {
                            String senderDomain = senderEmail.substring(senderEmail.indexOf("@") + 1);
                            for (MarketingContact c : tenantContacts) {
                                if (c.getEmail() != null && c.getEmail().toLowerCase(Locale.ROOT).endsWith("@" + senderDomain)) {
                                    matchedContact = c;
                                    contactId = c.getId();
                                    schoolName = c.getCompany() != null ? c.getCompany() : "";
                                    break;
                                }
                            }
                        }
                    }

                    // Only import if this email is associated with our leads / contacts OR is an inbound reply
                    String[] inReplyToHeaders = msg.getHeader("In-Reply-To");
                    String inReplyTo = (inReplyToHeaders != null && inReplyToHeaders.length > 0) ? inReplyToHeaders[0].trim() : null;

                    // If not directly in our contact list and not an in-reply-to, skip general spam/newsletters
                    if (matchedContact == null && inReplyTo == null) {
                        continue;
                    }

                    if (schoolName.isBlank() && senderEmail.contains("@")) {
                        String domainPart = senderEmail.substring(senderEmail.indexOf("@") + 1).replace(".com", "").replace(".ca", "").replace(".org", "");
                        schoolName = Character.toUpperCase(domainPart.charAt(0)) + domainPart.substring(1);
                    }

                    String subject = msg.getSubject() != null ? msg.getSubject() : "No Subject";
                    String body = extractBodyText(msg);
                    String cleanReply = extractCleanReply(body);
                    String snippet = cleanReply.length() > 240 ? cleanReply.substring(0, 240) + "..." : cleanReply;
                    if (snippet.isBlank()) {
                        snippet = body.length() > 240 ? body.substring(0, 240) + "..." : body;
                    }

                    Instant receivedAt = msg.getReceivedDate() != null ? msg.getReceivedDate().toInstant() :
                            (msg.getSentDate() != null ? msg.getSentDate().toInstant() : Instant.now());

                    MarketingCampaignReply reply = new MarketingCampaignReply(
                            UUID.randomUUID(),
                            tenantId,
                            null, // campaignId can be linked via inReplyTo if formatted
                            contactId,
                            senderEmail,
                            senderName,
                            imapUsername,
                            subject,
                            snippet,
                            body,
                            null,
                            rawMsgId,
                            inReplyTo,
                            schoolName,
                            receivedAt
                    );

                    replyRepository.save(reply);
                    newRepliesCount++;

                    // Auto-record a confirmed OPEN event if one is not recorded yet (a reply confirms the email was opened)
                    try {
                        if (!eventRepository.existsByTenantIdAndEventTypeAndContactEmail(tenantId, "OPEN", senderEmail)) {
                            MarketingCampaignEvent openEvent = new MarketingCampaignEvent(
                                    UUID.randomUUID(),
                                    tenantId,
                                    null,
                                    senderEmail,
                                    "OPEN",
                                    null,
                                    "IMAP-Verified",
                                    "Confirmed Open via Inbound Reply"
                            );
                            eventRepository.save(openEvent);
                            log.info("Auto-registered confirmed OPEN event for replying recipient: {}", senderEmail);
                        }
                    } catch (Exception ex) {
                        log.debug("Could not auto-register confirmed OPEN event: {}", ex.getMessage());
                    }

                    // Mark contact status as REPLIED
                    if (matchedContact != null) {
                        matchedContact.setCustomerStatus("REPLIED");
                        contactRepository.save(matchedContact);
                    }

                    log.info("Synchronized incoming email reply from: {} ({}) for tenant: {}", senderEmail, schoolName, tenantId);
                } catch (Exception msgEx) {
                    log.warn("Failed to parse incoming email message: {}", msgEx.getMessage());
                }
            }

            result.put("status", "SUCCESS");
            result.put("message", "IMAP sync completed successfully");
            result.put("newReplies", newRepliesCount);
            result.put("totalReplies", replyRepository.countByTenantId(tenantId));
            result.put("unreadReplies", replyRepository.countByTenantIdAndIsReadFalse(tenantId));

        } catch (Exception e) {
            log.error("IMAP synchronization failed: {}", e.getMessage(), e);
            result.put("status", "ERROR");
            result.put("message", "IMAP sync failed: " + e.getMessage());
            result.put("newReplies", newRepliesCount);
            result.put("totalReplies", replyRepository.countByTenantId(tenantId));
        } finally {
            try {
                if (folder != null && folder.isOpen()) folder.close(false);
                if (store != null && store.isConnected()) store.close();
            } catch (Exception ex) {
                log.debug("Error closing IMAP resources: {}", ex.getMessage());
            }
        }

        return result;
    }

    private String extractBodyText(Part part) throws Exception {
        if (part.isMimeType("text/plain")) {
            return (String) part.getContent();
        } else if (part.isMimeType("text/html")) {
            String html = (String) part.getContent();
            return html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
        } else if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mp.getCount(); i++) {
                String sub = extractBodyText(mp.getBodyPart(i));
                if (!sub.isBlank()) {
                    sb.append(sub).append("\n");
                    break; // prefer first plain text part
                }
            }
            return sb.toString().trim();
        }
        return "";
    }

    private String extractCleanReply(String fullText) {
        if (fullText == null || fullText.isBlank()) return "";
        String normalized = fullText.replace("\r\n", "\n").replace("\r", "\n");
        String[] patterns = new String[] {
            "(?i)\\n\\s*On\\s+.+?\\bwrote:\\s*",
            "(?i)\\n\\s*-{3,}\\s*Original Message\\s*-{3,}",
            "(?i)\\n\\s*From:\\s+.+?\\n(?:Sent|Date):\\s+",
            "(?i)\\n\\s*_{8,}",
            "(?i)\\n\\s*-{8,}",
            "(?i)\\n\\s*>\\s*"
        };
        for (String pat : patterns) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile(pat).matcher(normalized);
            if (m.find() && m.start() > 0) {
                String reply = normalized.substring(0, m.start()).trim();
                if (!reply.isBlank()) {
                    return reply;
                }
            }
        }
        return normalized.trim();
    }
}
