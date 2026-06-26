package it.ec.mfm.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfFilter;

@Configuration
@Profile("dev")
public class DevSecurityConfig {

    @Bean
    SecurityFilterChain developmentSecurityFilterChain(
            HttpSecurity http,
            @Value("${mfm.security.dev-user-name}") String name,
            @Value("${mfm.security.dev-user-email}") String email
    ) throws Exception {
        SecuritySupport.configureApiSecurity(http);
        HttpSessionSecurityContextRepository securityContextRepository =
                new HttpSessionSecurityContextRepository();

        http
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .securityContext(context -> context
                        .securityContextRepository(securityContextRepository)
                )
                .addFilterBefore(
                        new DevAuthenticationFilter(name, email, securityContextRepository),
                        CsrfFilter.class
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(204)
                        )
                );

        return http.build();
    }
}
