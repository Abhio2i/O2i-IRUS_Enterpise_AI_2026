package com.example.agentic_ai_platform.security.jwt;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import com.example.agentic_ai_platform.auth.entity.PlatformUser;

@Service
public class JwtService {
    private final JwtEncoder jwtEncoder;
    private final long accessTokenMinutes;

    public JwtService(JwtEncoder jwtEncoder,
            @Value("${app.auth.access-token-minutes}") long accessTokenMinutes) {
        this.jwtEncoder = jwtEncoder;
        this.accessTokenMinutes = accessTokenMinutes;
    }

    public IssuedAccessToken issueAccessToken(PlatformUser user, Instant issuedAt) {
        Instant expiresAt = issuedAt.plus(accessTokenMinutes, ChronoUnit.MINUTES);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("agentic-ai-platform")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("tenant_id", user.getTenantId().toString())
                .claim("email", user.getEmail())
                .claim("roles", List.of(user.getRole()))
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new IssuedAccessToken(token, expiresAt);
    }

    public record IssuedAccessToken(String value, Instant expiresAt) {}
}
