package com.example.agentic_ai_platform.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.agentic_ai_platform.security.jwt.JwtService;
import com.example.agentic_ai_platform.auth.dto.AuthRequests;
import com.example.agentic_ai_platform.auth.dto.AuthResponse;
import com.example.agentic_ai_platform.auth.entity.PlatformUser;
import com.example.agentic_ai_platform.auth.entity.RefreshSession;
import com.example.agentic_ai_platform.auth.repository.PlatformUserRepository;
import com.example.agentic_ai_platform.auth.repository.RefreshSessionRepository;
import com.example.agentic_ai_platform.auth.repository.TenantRepository;

@Service
public class AuthService {
    private final PlatformUserRepository users;
    private final TenantRepository tenants;
    private final RefreshSessionRepository refreshSessions;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final boolean registrationEnabled;
    private final long refreshTokenDays;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(PlatformUserRepository users, TenantRepository tenants,
            RefreshSessionRepository refreshSessions, PasswordEncoder passwordEncoder, JwtService jwtService,
            @Value("${app.auth.registration-enabled}") boolean registrationEnabled,
            @Value("${app.auth.refresh-token-days}") long refreshTokenDays) {
        this.users = users;
        this.tenants = tenants;
        this.refreshSessions = refreshSessions;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.registrationEnabled = registrationEnabled;
        this.refreshTokenDays = refreshTokenDays;
    }

    @Transactional
    public AuthResponse register(AuthRequests.Register request) {
        if (!registrationEnabled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration is disabled");
        }
        String email = normalizeEmail(request.email());
        if (!tenants.existsById(request.tenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found");
        }
        if (users.existsByTenantIdAndEmail(request.tenantId(), email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered for this tenant");
        }
        PlatformUser user = users.save(new PlatformUser(UUID.randomUUID(), request.tenantId(), email,
                request.displayName().trim(), passwordEncoder.encode(request.password())));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(AuthRequests.Login request) {
        PlatformUser user = users.findByTenantIdAndEmail(request.tenantId(), normalizeEmail(request.email()))
                .filter(PlatformUser::isEnabled)
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(this::invalidCredentials);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshSession session = refreshSessions.findForUpdateByTokenHash(hash(rawRefreshToken))
                .orElseThrow(this::invalidCredentials);
        Instant now = Instant.now();
        if (!session.isValidAt(now)) {
            throw invalidCredentials();
        }
        PlatformUser user = users.findById(session.getUserId())
                .filter(PlatformUser::isEnabled)
                .orElseThrow(this::invalidCredentials);
        String nextRefreshToken = newRefreshToken();
        session.rotate(hash(nextRefreshToken), now.plus(refreshTokenDays, ChronoUnit.DAYS));
        return issueAccessToken(user, nextRefreshToken, now);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshSessions.findForUpdateByTokenHash(hash(rawRefreshToken))
                .ifPresent(session -> session.revoke(Instant.now()));
    }

    private AuthResponse issueTokens(PlatformUser user) {
        Instant now = Instant.now();
        String refreshToken = newRefreshToken();
        refreshSessions.save(new RefreshSession(UUID.randomUUID(), user.getId(), hash(refreshToken),
                now.plus(refreshTokenDays, ChronoUnit.DAYS)));
        return issueAccessToken(user, refreshToken, now);
    }

    private AuthResponse issueAccessToken(PlatformUser user, String refreshToken, Instant now) {
        JwtService.IssuedAccessToken accessToken = jwtService.issueAccessToken(user, now);
        return new AuthResponse(accessToken.value(), "Bearer", accessToken.expiresAt(), refreshToken, user.getId(), user.getTenantId(),
                user.getEmail(), user.getDisplayName());
    }

    private String newRefreshToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials or refresh token");
    }
}
