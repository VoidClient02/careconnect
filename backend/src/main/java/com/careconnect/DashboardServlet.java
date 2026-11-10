package com.careconnect;
import java.io.IOException;
import java.sql.SQLException;
import java.util.*;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/api/dashboard")
public class DashboardServlet extends HttpServlet {
    private static final String APPT = "SELECT a.id, a.mode, a.status, a.reason, DATE_FORMAT(a.scheduled_at,'%Y-%m-%d %H:%i') AS when_at, ";
    private static final String CASES = "SELECT e.patient_name, e.location, e.condition_desc, e.priority, DATE_FORMAT(e.created_at,'%Y-%m-%d %H:%i') AS at, p.full_name AS paramedic "
        + "FROM emergency_cases e JOIN users p ON p.id=e.paramedic_id ";
    private static final String PATIENTS = "SELECT id, full_name FROM users WHERE role='PATIENT' ORDER BY full_name";

    @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int me = Web.uid(req);
        Map<String, Object> out = new HashMap<>();
        String role = (String) req.getSession().getAttribute("role");
        try {
            switch (role) {
                case "PATIENT":
                    out.put("doctors", Db.query("SELECT id, full_name, specialty FROM users WHERE role='DOCTOR' ORDER BY specialty, full_name"));
                    out.put("appts", Db.query(APPT + "d.full_name AS doctor, d.specialty FROM appointments a JOIN users d ON d.id=a.doctor_id WHERE a.patient_id=? ORDER BY a.scheduled_at DESC", me));
                    out.put("rx", Db.query("SELECT p.medication, p.dosage, p.instructions, p.status, d.full_name AS doctor FROM prescriptions p JOIN users d ON d.id=p.doctor_id WHERE p.patient_id=? ORDER BY p.id DESC", me));
                    out.put("vitals", Db.query("SELECT bp, temperature, pulse, DATE_FORMAT(recorded_at,'%Y-%m-%d %H:%i') AS at FROM vitals WHERE patient_id=? ORDER BY id DESC LIMIT 5", me));
                    break;
                case "DOCTOR":
                    out.put("appts", Db.query(APPT + "p.full_name AS patient FROM appointments a JOIN users p ON p.id=a.patient_id WHERE a.doctor_id=? ORDER BY a.scheduled_at", me));
                    out.put("patients", Db.query(PATIENTS));
                    out.put("cases", Db.query(CASES + "ORDER BY FIELD(e.priority,'CRITICAL','HIGH','MEDIUM','LOW'), e.id DESC LIMIT 20"));
                    break;
                case "NURSE":
                    out.put("patients", Db.query(PATIENTS));
                    out.put("vitals", Db.query("SELECT p.full_name AS patient, v.bp, v.temperature, v.pulse, v.notes, DATE_FORMAT(v.recorded_at,'%Y-%m-%d %H:%i') AS at FROM vitals v JOIN users p ON p.id=v.patient_id ORDER BY v.id DESC LIMIT 15"));
                    out.put("appts", Db.query(APPT + "p.full_name AS patient, d.full_name AS doctor FROM appointments a JOIN users p ON p.id=a.patient_id JOIN users d ON d.id=a.doctor_id WHERE a.scheduled_at >= CURDATE() AND a.status IN ('REQUESTED','CONFIRMED') ORDER BY a.scheduled_at LIMIT 20"));
                    out.put("cases", Db.query(CASES + "ORDER BY FIELD(e.priority,'CRITICAL','HIGH','MEDIUM','LOW'), e.id DESC LIMIT 20"));
                    break;
                case "PARAMEDIC":
                    out.put("cases", Db.query(CASES + "WHERE e.paramedic_id=? ORDER BY e.id DESC LIMIT 20", me));
                    break;
                case "PHARMACIST":
                    String rx = "SELECT p.id, p.medication, p.dosage, p.instructions, pt.full_name AS patient, d.full_name AS doctor FROM prescriptions p JOIN users pt ON pt.id=p.patient_id JOIN users d ON d.id=p.doctor_id ";
                    out.put("pending", Db.query(rx + "WHERE p.status='PENDING' ORDER BY p.id"));
                    out.put("history", Db.query(rx + "WHERE p.status='DISPENSED' ORDER BY p.dispensed_at DESC LIMIT 20"));
                    break;
                case "ADMIN":
                    out.put("patients", Db.query(PATIENTS));
                    out.put("doctors", Db.query("SELECT id, full_name, specialty FROM users WHERE role='DOCTOR' ORDER BY specialty, full_name"));
                    out.put("appts", Db.query(APPT + "p.full_name AS patient, d.full_name AS doctor FROM appointments a JOIN users p ON p.id=a.patient_id JOIN users d ON d.id=a.doctor_id ORDER BY a.scheduled_at DESC LIMIT 20"));
                    out.put("vitals", Db.query("SELECT p.full_name AS patient, v.bp, v.temperature, v.pulse, DATE_FORMAT(v.recorded_at,'%Y-%m-%d %H:%i') AS at FROM vitals v JOIN users p ON p.id=v.patient_id ORDER BY v.id DESC LIMIT 20"));
                    out.put("cases", Db.query(CASES + "ORDER BY FIELD(e.priority,'CRITICAL','HIGH','MEDIUM','LOW'), e.id DESC LIMIT 20"));
                    break;
                default: Web.json(resp, 403, Map.of("error", "Unknown role")); return;
            }
        } catch (SQLException e) { throw new ServletException(e); }
        Web.json(resp, 200, out);
    }
}
