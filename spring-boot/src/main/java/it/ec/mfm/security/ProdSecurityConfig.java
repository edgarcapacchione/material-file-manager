package it.ec.mfm.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Profile("prod")
@EnableConfigurationProperties(MfmSecurityProperties.class)
public class ProdSecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProdSecurityConfig.class);

    @Bean
    SecurityFilterChain productionSecurityFilterChain(
            HttpSecurity http,
            OAuth2UserService<OidcUserRequest, OidcUser> authorizedOidcUserService
    ) throws Exception {
        SecuritySupport.configureApiSecurity(http);

        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/error").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().denyAll()
                )
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(authorizedOidcUserService)
                        )
                        .defaultSuccessUrl("/", true)
                        .failureUrl("/login?error=oauth")
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(204)
                        )
                );

        return http.build();
    }

    @Bean
    OidcUserAuthorization oidcUserAuthorization(MfmSecurityProperties properties) {
        return new OidcUserAuthorization(properties);
    }

    @Bean
    OAuth2UserService<OidcUserRequest, OidcUser> authorizedOidcUserService(
            MfmSecurityProperties properties,
            OidcUserAuthorization authorization
    ) {
        properties.requireAllowlist();
        OidcUserService delegate = new OidcUserService();

        return request -> {
            OidcUser user = delegate.loadUser(request);
            if (authorization.isAllowed(user)) {
                return user;
            }

            String identity = authorization.canonicalIdentity(user);
            LOGGER.warn("Rejected OIDC user identity={} email={}", identity, user.getEmail());
            OAuth2Error error = new OAuth2Error("user_not_allowed");
            throw new OAuth2AuthenticationException(error, "User is not in the MFM allowlist");
        };
    }
}
