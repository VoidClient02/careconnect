package com.careconnect;

import ch.vorburger.mariadb4j.DB;
import ch.vorburger.mariadb4j.DBConfigurationBuilder;
import java.io.File;
import java.nio.file.*;
import java.sql.*;
import org.apache.catalina.Context;
import org.apache.catalina.WebResourceRoot;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.StandardRoot;

/**
 * Local test server: embedded MariaDB (MySQL-compatible, data in backend/dev-data/) + embedded Tomcat 9.
 * Run from VS Code (F5 -> "CareConnect: embedded Tomcat + DB") with working dir = backend/.
 * Lives in src/test so it is never packaged into the WAR.
 */
public class DevServer {
    static final int DB_PORT = 3307;

    public static void main(String[] args) throws Exception {
        // ---- 1. embedded database ----
        Path data = Paths.get("dev-data");
        DBConfigurationBuilder cfg = DBConfigurationBuilder.newBuilder();
        cfg.setPort(DB_PORT);
        cfg.setDataDir(data.resolve("db").toString());
        cfg.setBaseDir(data.resolve("mariadb").toString());
        DB db = DB.newEmbeddedDB(cfg.build());
        db.start();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> { try { db.stop(); } catch (Exception ignored) {} }));
        runSchema(Paths.get("..", "database", "schema.sql"));

        // point the app's Db helper at it (overrides db.properties)
        System.setProperty("db.driver", "org.mariadb.jdbc.Driver");
        System.setProperty("db.url", "jdbc:mariadb://localhost:" + DB_PORT + "/careconnect");
        System.setProperty("db.user", "root");
        System.setProperty("db.password", "");

        // ---- 2. embedded Tomcat serving src/main/webapp + target/classes ----
        int port = Integer.parseInt(System.getProperty("port", "8080"));
        Tomcat tomcat = new Tomcat();
        tomcat.setBaseDir(data.resolve("tomcat").toAbsolutePath().toString());
        tomcat.setPort(port);
        tomcat.getConnector();
        Context ctx = tomcat.addWebapp("/careconnect", new File("src/main/webapp").getAbsolutePath());
        ctx.setParentClassLoader(DevServer.class.getClassLoader());
        WebResourceRoot res = new StandardRoot(ctx);
        res.addPreResources(new DirResourceSet(res, "/WEB-INF/classes", new File("target/classes").getAbsolutePath(), "/"));
        ctx.setResources(res);
        tomcat.start();

        System.out.println("\n=== CareConnect running: http://localhost:" + port + "/careconnect/ ===");
        System.out.println("=== Demo login: patient@careconnect.test / Pass1234!  (see README for all roles) ===\n");
        tomcat.getServer().await();
    }

    /** Runs database/schema.sql (idempotent: IF NOT EXISTS / INSERT IGNORE) so every start has tables + demo users. */
    static void runSchema(Path file) throws Exception {
        StringBuilder sql = new StringBuilder();
        for (String line : Files.readAllLines(file)) if (!line.trim().startsWith("--")) sql.append(line).append('\n');
        try (Connection c = DriverManager.getConnection("jdbc:mariadb://localhost:" + DB_PORT + "/?user=root"); Statement st = c.createStatement()) {
            for (String stmt : sql.toString().split(";")) if (!stmt.isBlank()) st.execute(stmt);
        }
    }
}
