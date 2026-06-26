package it.ec.mfm.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OidcUserAuthorizationTest {

    @Test
    void allowsCanonicalIssuerAndSubjectIdentity() {
        MfmSecurityProperties properties = new MfmSecurityProperties();
        properties.setAllowedIdentities(Set.of("https://issuer.example|subject-123"));
        OidcUserAuthorization authorization = new OidcUserAuthorization(properties);

        assertTrue(authorization.isAllowed(user("subject-123", "other@example.com", false)));
    }

    @Test
    void allowsOnlyVerifiedAllowlistedEmail() {
        MfmSecurityProperties properties = new MfmSecurityProperties();
        properties.setAllowedEmails(Set.of("owner@example.com"));
        OidcUserAuthorization authorization = new OidcUserAuthorization(properties);

        assertTrue(authorization.isAllowed(user("subject-123", "OWNER@example.com", true)));
        assertFalse(authorization.isAllowed(user("subject-123", "owner@example.com", false)));
    }

    @Test
    void rejectsUserOutsideAllowlist() {
        MfmSecurityProperties properties = new MfmSecurityProperties();
        properties.setAllowedEmails(Set.of("owner@example.com"));
        OidcUserAuthorization authorization = new OidcUserAuthorization(properties);

        assertFalse(authorization.isAllowed(user("subject-999", "intruder@example.com", true)));
    }

    @Test
    void productionRequiresAnAllowlist() {
        MfmSecurityProperties properties = new MfmSecurityProperties();

        assertThrows(IllegalStateException.class, properties::requireAllowlist);
    }

    private static OidcUser user(String subject, String email, boolean emailVerified) {
        Instant issuedAt = Instant.now();
        OidcIdToken idToken = new OidcIdToken(
                "id-token",
                issuedAt,
                issuedAt.plusSeconds(300),
                Map.of(
                        "iss", "https://issuer.example",
                        "sub", subject,
                        "name", "Test User",
                        "email", email,
                        "email_verified", emailVerified
                )
        );
        return new DefaultOidcUser(
                List.of(new SimpleGrantedAuthority("OIDC_USER")),
                idToken
        );
    }
}
