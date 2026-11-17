package com.example.agentic_ai_platform.security.jwt;

import java.time.Duration;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtCookieService {
    private static final String ACCESS_COOKIE_NAME = "access_token";
    private static final String REFRESH_COOKIE_NAME = "refresh_token";
    private final boolean secure;
    private final long refreshTokenDays;

    public JwtCookieService(@Value("${app.auth.cookie-secure:true}") boolean secure,
            @Value("${app.auth.refresh-token-days}") long refreshTokenDays) {
        this.secure = secure;
        this.refreshTokenDays = refreshTokenDays;
    }

    public void addAuthCookies(HttpHeaders headers, String accessToken, java.time.Instant accessTokenExpiresAt,
            String refreshToken) {
        Duration accessMaxAge = Duration.between(java.time.Instant.now(), accessTokenExpiresAt);
        headers.add(HttpHeaders.SET_COOKIE, accessCookie(accessToken, accessMaxAge).toString());
        addRefreshToken(headers, refreshToken);
    }

    public void addRefreshToken(HttpHeaders headers, String token) {
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie(token, Duration.ofDays(refreshTokenDays)).toString());
    }

    public void clearAuthCookies(HttpHeaders headers) {
        headers.add(HttpHeaders.SET_COOKIE, accessCookie("", Duration.ZERO).toString());
        clearRefreshToken(headers);
    }

    public void clearRefreshToken(HttpHeaders headers) {
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString());
    }

    public String readRefreshToken(HttpServletRequest request) {
        return readCookie(request, REFRESH_COOKIE_NAME);
    }

    public String readAccessToken(HttpServletRequest request) {
        return readCookie(request, ACCESS_COOKIE_NAME);
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .map(jakarta.servlet.http.Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private ResponseCookie accessCookie(String value, Duration maxAge) {
        return ResponseCookie.from(ACCESS_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge.isNegative() ? Duration.ZERO : maxAge)
                .build();
    }

    private ResponseCookie refreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(maxAge)
                .build();
    }
}
