package com.careconnect;
import com.google.gson.*;
import java.io.IOException;
import java.util.Map;
import javax.servlet.http.*;

public final class Web {
    private static final Gson G = new Gson();
    private Web() {}
    /** Parsed JSON request body (cached per request). */
    public static JsonObject body(HttpServletRequest r) {
        Object o = r.getAttribute("body"); if (o != null) return (JsonObject) o;
        JsonObject j = new JsonObject();
        try { JsonElement e = JsonParser.parseReader(r.getReader()); if (e != null && e.isJsonObject()) j = e.getAsJsonObject(); } catch (Exception ignored) {}
        r.setAttribute("body", j); return j;
    }
    public static String raw(HttpServletRequest r, String n) {
        try { JsonElement e = body(r).get(n); return e == null || e.isJsonNull() ? "" : e.getAsString(); } catch (Exception e) { return ""; }
    }
    public static String s(HttpServletRequest r, String n) { return raw(r, n).trim(); }
    public static int i(HttpServletRequest r, String n) { try { return Integer.parseInt(s(r, n)); } catch (NumberFormatException e) { return -1; } }
    public static int uid(HttpServletRequest r) { return (Integer) r.getSession().getAttribute("userId"); }
    public static void json(HttpServletResponse p, int status, Object o) throws IOException {
        p.setStatus(status); p.setContentType("application/json;charset=UTF-8"); p.getWriter().write(G.toJson(o));
    }
    public static void ok(HttpServletResponse p, String msg) throws IOException { json(p, 200, Map.of("message", msg)); }
    public static void bad(HttpServletResponse p, String msg) throws IOException { json(p, 400, Map.of("error", msg)); }
}
