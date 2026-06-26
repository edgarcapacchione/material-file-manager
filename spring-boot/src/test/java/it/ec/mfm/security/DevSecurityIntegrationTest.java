package it.ec.mfm.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.notNullValue;

@SpringBootTest(properties = {
        "mfm.root.path=${java.io.tmpdir}/mfm-security-integration",
        "debug=false",
        "logging.level.root=WARN"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class DevSecurityIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void currentUserReturnsDevIdentityAndXsrfCookie() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("dev-user"))
                .andExpect(jsonPath("$.provider").value("dev"))
                .andExpect(request().sessionAttribute("SPRING_SECURITY_CONTEXT", notNullValue()))
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test
    void unsafeRequestWithoutCsrfTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isForbidden());
    }

    @Test
    void unsafeRequestWithCsrfTokenIsAccepted() throws Exception {
        mockMvc.perform(post("/api/auth/logout").with(csrf()))
                .andExpect(status().isNoContent());
    }
}
