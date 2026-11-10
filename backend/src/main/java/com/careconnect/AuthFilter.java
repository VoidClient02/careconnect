package com.careconnect;
import java.io.IOException;
import java.util.Map;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.*;

/** Guards /api/*: session required, role per action, CSRF header (X-CSRF-Token) on writes. */
@WebFilter("/api/*")
public class AuthFilter implements Filter {
    private static final Map<String, String> ROLES = Map.of(
        "/api/appointments/book", "PATIENT", "/api/appointments/status", "DOCTOR",
        "/api/prescriptions/create", "DOCTOR", "/api/prescriptions/dispense", "PHARMACIST",
        "/api/vitals/record", "NURSE", "/api/emergency/log", "PARAMEDIC");

    @Override public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) rq; HttpServletResponse resp = (HttpServletResponse) rs;
        req.setCharacterEncoding("UTF-8");
        String path = req.getRequestURI().substring(req.getContextPath().length());
        boolean open = path.equals("/api/auth/login") || path.equals("/api/auth/signup");
        HttpSession s = req.getSession(false);
        boolean authed = s != null && s.getAttribute("userId") != null;
        if (!open && !authed) { Web.json(resp, 401, Map.of("error", "Not signed in")); return; }
        if (authed && !open) {
            String need = ROLES.get(path);
            if (need != null && !need.equals(s.getAttribute("role"))) { Web.json(resp, 403, Map.of("error", "Not allowed for your role")); return; }
            if (!"GET".equals(req.getMethod()) && !s.getAttribute("csrf").equals(req.getHeader("X-CSRF-Token"))) { Web.json(resp, 403, Map.of("error", "Bad CSRF token")); return; }
        }
        chain.doFilter(rq, rs);
    }
}
