package com.careconnect;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet({"/api/prescriptions/create", "/api/prescriptions/dispense"})
public class PrescriptionServlet extends HttpServlet {
    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            if (req.getServletPath().endsWith("create")) {
                String med = Web.s(req, "medication"), dose = Web.s(req, "dosage"), ins = Web.s(req, "instructions");
                if (med.isEmpty() || dose.isEmpty()) { Web.bad(resp, "Medication and dosage are required."); return; }
                int n = Db.update("INSERT INTO prescriptions(patient_id,doctor_id,medication,dosage,instructions) SELECT id,?,?,?,? FROM users WHERE id=? AND role='PATIENT'",
                    Web.uid(req), med, dose, ins, Web.i(req, "patientId"));
                if (n > 0) Web.ok(resp, "Prescription sent to pharmacy."); else Web.bad(resp, "Patient not found.");
            } else {
                int n = Db.update("UPDATE prescriptions SET status='DISPENSED', dispensed_by=?, dispensed_at=NOW() WHERE id=? AND status='PENDING'", Web.uid(req), Web.i(req, "id"));
                if (n > 0) Web.ok(resp, "Prescription dispensed."); else Web.bad(resp, "Already dispensed or not found.");
            }
        } catch (SQLException e) { throw new ServletException(e); }
    }
}
