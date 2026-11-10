package com.careconnect;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Set;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/emergency/log")
public class EmergencyServlet extends HttpServlet {
    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String name = Web.s(req, "patientName"), loc = Web.s(req, "location"), cond = Web.s(req, "condition"), pr = Web.s(req, "priority");
        if (name.isEmpty() || loc.isEmpty() || cond.isEmpty() || !Set.of("LOW", "MEDIUM", "HIGH", "CRITICAL").contains(pr)) { Web.bad(resp, "Fill in all fields."); return; }
        try {
            Db.update("INSERT INTO emergency_cases(paramedic_id,patient_name,location,condition_desc,priority) VALUES(?,?,?,?,?)", Web.uid(req), name, loc, cond, pr);
            Web.ok(resp, "Emergency case logged; ER staff can see it.");
        } catch (SQLException e) { throw new ServletException(e); }
    }
}
