package com.careconnect;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/vitals/record")
public class VitalsServlet extends HttpServlet {
    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        double temp; int pulse;
        try { temp = Double.parseDouble(Web.s(req, "temperature")); pulse = Integer.parseInt(Web.s(req, "pulse")); }
        catch (NumberFormatException e) { Web.bad(resp, "Invalid temperature or pulse."); return; }
        if (temp < 25 || temp > 45 || pulse < 20 || pulse > 250) { Web.bad(resp, "Values out of range."); return; }
        try {
            int n = Db.update("INSERT INTO vitals(patient_id,nurse_id,bp,temperature,pulse,notes) SELECT id,?,?,?,?,? FROM users WHERE id=? AND role='PATIENT'",
                Web.uid(req), Web.s(req, "bp"), temp, pulse, Web.s(req, "notes"), Web.i(req, "patientId"));
            if (n > 0) Web.ok(resp, "Vitals recorded."); else Web.bad(resp, "Patient not found.");
        } catch (SQLException e) { throw new ServletException(e); }
    }
}
