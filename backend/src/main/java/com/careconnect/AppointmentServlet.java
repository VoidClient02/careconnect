package com.careconnect;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.Set;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet({"/api/appointments/book", "/api/appointments/status"})
public class AppointmentServlet extends HttpServlet {
    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            if (req.getServletPath().endsWith("book")) {
                String reason = Web.s(req, "reason"), mode = Web.s(req, "mode");
                Timestamp ts;
                try { ts = Timestamp.valueOf(LocalDateTime.parse(Web.s(req, "scheduledAt"))); }
                catch (Exception e) { Web.bad(resp, "Invalid date/time."); return; }
                if (ts.before(new Timestamp(System.currentTimeMillis()))) { Web.bad(resp, "Pick a future date/time."); return; }
                if (reason.isEmpty() || !Set.of("VIRTUAL", "IN_PERSON").contains(mode)) { Web.bad(resp, "Invalid appointment details."); return; }
                int n = Db.update("INSERT INTO appointments(patient_id,doctor_id,scheduled_at,mode,reason) SELECT ?,id,?,?,? FROM users WHERE id=? AND role='DOCTOR'",
                    Web.uid(req), ts, mode, reason, Web.i(req, "doctorId"));
                if (n > 0) Web.ok(resp, "Appointment requested."); else Web.bad(resp, "Doctor not found.");
            } else {
                String st = Web.s(req, "status");
                if (!Set.of("CONFIRMED", "COMPLETED", "CANCELLED").contains(st)) { Web.bad(resp, "Invalid status."); return; }
                Db.update("UPDATE appointments SET status=? WHERE id=? AND doctor_id=?", st, Web.i(req, "id"), Web.uid(req));
                Web.ok(resp, "Appointment updated.");
            }
        } catch (SQLException e) { throw new ServletException(e); }
    }
}
