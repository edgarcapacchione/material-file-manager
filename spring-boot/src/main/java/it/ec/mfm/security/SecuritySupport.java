package it.ec.mfm.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

final class SecuritySupport {

    private SecuritySupport() {
    }

    static void configureApiSecurity(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .sessionManagement(session -> session
                        .sessionFixation(fixation -> fixation.migrateSession())
                )
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'"))
                        .frameOptions(frame -> frame.deny())
                );
    }

    private static AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, exception) ->
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Authentication required");
    }

    private static AccessDeniedHandler accessDeniedHandler() {
        return (request, response, exception) ->
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
    }
}
