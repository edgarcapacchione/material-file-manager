package it.ec.mfm.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public AuthenticatedUser me(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof OidcUser oidcUser) {
            return new AuthenticatedUser(
                    oidcUser.getSubject(),
                    oidcUser.getFullName() != null ? oidcUser.getFullName() : oidcUser.getName(),
                    oidcUser.getEmail(),
                    oidcUser.getPicture(),
                    "oidc"
            );
        }
        if (principal instanceof DevAuthenticationFilter.DevUser devUser) {
            return new AuthenticatedUser(
                    devUser.subject(),
                    devUser.name(),
                    devUser.email(),
                    null,
                    "dev"
            );
        }
        return new AuthenticatedUser(
                authentication.getName(),
                authentication.getName(),
                null,
                null,
                "unknown"
        );
    }

    public record AuthenticatedUser(
            String subject,
            String name,
            String email,
            String picture,
            String provider
    ) {
    }
}
