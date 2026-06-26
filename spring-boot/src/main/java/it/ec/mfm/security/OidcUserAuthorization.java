package it.ec.mfm.security;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Locale;

public class OidcUserAuthorization {

    private final MfmSecurityProperties properties;

    public OidcUserAuthorization(MfmSecurityProperties properties) {
        this.properties = properties;
    }

    public boolean isAllowed(OidcUser user) {
        String identity = canonicalIdentity(user);
        if (properties.getAllowedIdentities().contains(identity)) {
            return true;
        }

        String email = user.getEmail();
        return Boolean.TRUE.equals(user.getEmailVerified())
                && email != null
                && properties.getAllowedEmails().contains(email.toLowerCase(Locale.ROOT));
    }

    public String canonicalIdentity(OidcUser user) {
        return user.getIssuer() + "|" + user.getSubject();
    }
}
