package com.careconnect;
import java.io.InputStream;
import java.sql.*;
import java.util.*;

public final class Db {
    private static final Properties P = new Properties();
    static {
        try (InputStream in = Db.class.getClassLoader().getResourceAsStream("db.properties")) { P.load(in); }
        catch (Exception e) { throw new ExceptionInInitializerError(e); }
        // -Ddb.url / db.user / db.password / db.driver override db.properties (used by the embedded dev server)
        for (String k : new String[]{"url", "user", "password", "driver"}) { String v = System.getProperty("db." + k); if (v != null) P.setProperty(k, v); }
    }
    private Db() {}
    public static Connection get() throws SQLException {
        try { Class.forName(P.getProperty("driver", "com.mysql.cj.jdbc.Driver")); } catch (ClassNotFoundException e) { throw new SQLException(e); }
        return DriverManager.getConnection(P.getProperty("url"), P.getProperty("user"), P.getProperty("password"));
    }
    public static List<Map<String, Object>> query(String sql, Object... args) throws SQLException {
        try (Connection c = get(); PreparedStatement ps = c.prepareStatement(sql)) {
            bind(ps, args);
            try (ResultSet rs = ps.executeQuery()) {
                ResultSetMetaData md = rs.getMetaData();
                List<Map<String, Object>> out = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= md.getColumnCount(); i++) row.put(md.getColumnLabel(i), rs.getObject(i));
                    out.add(row);
                }
                return out;
            }
        }
    }
    public static int update(String sql, Object... args) throws SQLException {
        try (Connection c = get(); PreparedStatement ps = c.prepareStatement(sql)) { bind(ps, args); return ps.executeUpdate(); }
    }
    private static void bind(PreparedStatement ps, Object[] a) throws SQLException {
        for (int i = 0; i < a.length; i++) ps.setObject(i + 1, a[i]);
    }
}
