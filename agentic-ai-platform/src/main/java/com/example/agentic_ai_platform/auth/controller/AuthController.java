package com.example.agentic_ai_platform.auth.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.agentic_ai_platform.auth.service.AuthService;
import com.example.agentic_ai_platform.auth.dto.AuthRequests;
import com.example.agentic_ai_platform.auth.dto.AuthResponse;
import com.example.agentic_ai_platform.auth.dto.AuthUserResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthUserResponse> register(@Valid @RequestBody AuthRequests.Register request) {
        return authResponse(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthUserResponse> login(@Valid @RequestBody AuthRequests.Login request) {
        return authResponse(authService.login(request), HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthUserResponse> refresh(@RequestBody RefreshRequest request) {
        return authResponse(authService.refresh(request.refreshToken()), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshRequest request) {
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            authService.logout(request.refreshToken());
        }
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<AuthUserResponse> authResponse(AuthResponse response, HttpStatus status) {
        return ResponseEntity.status(status).body(AuthUserResponse.from(response));
    }

    public record RefreshRequest(String refreshToken) {}
}
