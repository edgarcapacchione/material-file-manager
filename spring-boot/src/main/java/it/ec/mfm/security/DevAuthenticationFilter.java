package it.ec.mfm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

final class DevAuthenticationFilter extends OncePerRequestFilter {

    private final DevUser principal;
    private final SecurityContextRepository securityContextRepository;

    DevAuthenticationFilter(
            String name,
            String email,
            SecurityContextRepository securityContextRepository
    ) {
        this.principal = new DevUser("dev-user", name, email);
        this.securityContextRepository = securityContextRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication =
                    UsernamePasswordAuthenticationToken.authenticated(
                            principal,
                            null,
                            AuthorityUtils.createAuthorityList("ROLE_USER")
                    );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);
        }
        filterChain.doFilter(request, response);
    }

    record DevUser(String subject, String name, String email) {
    }
}
