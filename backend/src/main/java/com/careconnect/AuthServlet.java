package com.careconnect;
import java.io.IOException;
import java.sql.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private static final Set<String> ROLES = Set.of("PATIENT", "DOCTOR", "NURSE", "PARAMEDIC", "PHARMACIST", "ADMIN");

    private static Map<String, Object> user(HttpSession s) {
        return Map.of("id", s.getAttribute("userId"), "name", s.getAttribute("userName"), "role", s.getAttribute("role"), "csrf", s.getAttribute("csrf"));
    }
    @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if ("/me".equals(req.getPathInfo())) Web.json(resp, 200, user(req.getSession())); else resp.sendError(404);
    }
    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String p = String.valueOf(req.getPathInfo());
        try {
            switch (p) {
                case "/login": login(req, resp); break;
                case "/signup": signup(req, resp); break;
                case "/logout": { HttpSession s = req.getSession(false); if (s != null) s.invalidate(); Web.ok(resp, "Logged out."); break; }
                default: resp.sendError(404);
            }
        } catch (SQLException e) { throw new ServletException(e); }
    }
    private void login(HttpServletRequest req, HttpServletResponse resp) throws SQLException, IOException {
        String email = Web.s(req, "email").toLowerCase(), pw = Web.raw(req, "password");
        List<Map<String, Object>> r = Db.query("SELECT id, full_name, role, salt, password_hash FROM users WHERE email=?", email);
        if (r.isEmpty() || pw.isEmpty() || !Security.matches(pw, (String) r.get(0).get("salt"), (String) r.get(0).get("password_hash"))) {
            Web.json(resp, 401, Map.of("error", "Invalid email or password.")); return;
        }
        Map<String, Object> u = r.get(0);
        HttpSession old = req.getSession(false); if (old != null) old.invalidate();
        HttpSession s = req.getSession(true);
        s.setAttribute("userId", ((Number) u.get("id")).intValue());
        s.setAttribute("userName", u.get("full_name"));
        s.setAttribute("role", u.get("role"));
        s.setAttribute("csrf", Security.newSalt());
        Web.json(resp, 200, user(s));
    }
    private void signup(HttpServletRequest req, HttpServletResponse resp) throws SQLException, IOException {
        String name = Web.s(req, "fullName"), email = Web.s(req, "email").toLowerCase(), pw = Web.raw(req, "password");
        String role = Web.s(req, "role"), spec = Web.s(req, "specialty"), lic = Web.s(req, "licenseNo");
        if (name.isEmpty() || !email.contains("@")) { Web.bad(resp, "Enter your name and a valid email."); return; }
        if (pw.length() < 8) { Web.bad(resp, "Password must be at least 8 characters."); return; }
        if (!ROLES.contains(role)) { Web.bad(resp, "Choose a valid role."); return; }
        if (role.equals("DOCTOR") && spec.isEmpty()) { Web.bad(resp, "Doctors must choose a specialty."); return; }
        String salt = Security.newSalt();
        try {
            Db.update("INSERT INTO users(full_name,email,salt,password_hash,role,specialty,license_no) VALUES(?,?,?,?,?,?,?)",
                name, email, salt, Security.hash(salt, pw), role, role.equals("DOCTOR") ? spec : null, lic.isEmpty() ? null : lic);
            Web.ok(resp, "Account created.");
        } catch (SQLIntegrityConstraintViolationException e) { Web.json(resp, 409, Map.of("error", "That email is already registered.")); }
    }
}
