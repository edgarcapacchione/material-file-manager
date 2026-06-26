package it.ec.mfm.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@ConfigurationProperties(prefix = "mfm.security")
public class MfmSecurityProperties {

    private Set<String> allowedIdentities = new LinkedHashSet<>();
    private Set<String> allowedEmails = new LinkedHashSet<>();

    public Set<String> getAllowedIdentities() {
        return allowedIdentities;
    }

    public void setAllowedIdentities(Set<String> allowedIdentities) {
        this.allowedIdentities = normalize(allowedIdentities, false);
    }

    public Set<String> getAllowedEmails() {
        return allowedEmails;
    }

    public void setAllowedEmails(Set<String> allowedEmails) {
        this.allowedEmails = normalize(allowedEmails, true);
    }

    public void requireAllowlist() {
        if (allowedIdentities.isEmpty() && allowedEmails.isEmpty()) {
            throw new IllegalStateException(
                    "Production requires MFM_ALLOWED_IDENTITIES or MFM_ALLOWED_EMAILS"
            );
        }
    }

    private static Set<String> normalize(Set<String> values, boolean lowerCase) {
        if (values == null) {
            return new LinkedHashSet<>();
        }
        return values.stream()
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> lowerCase ? value.toLowerCase(Locale.ROOT) : value)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
