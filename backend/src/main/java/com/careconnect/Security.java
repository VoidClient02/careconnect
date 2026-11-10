package com.careconnect;
import java.nio.charset.StandardCharsets;
import java.security.*;

/** Prototype-grade hashing (salted SHA-256). Use BCrypt/Argon2 for production. */
public final class Security {
    private Security() {}
    public static String newSalt() {
        byte[] b = new byte[16]; new SecureRandom().nextBytes(b); return hex(b);
    }
    public static String hash(String salt, String pw) {
        try { return hex(MessageDigest.getInstance("SHA-256").digest((salt + pw).getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    public static boolean matches(String pw, String salt, String expected) {
        return MessageDigest.isEqual(hash(salt, pw).getBytes(StandardCharsets.UTF_8), expected.getBytes(StandardCharsets.UTF_8));
    }
    private static String hex(byte[] b) { StringBuilder s = new StringBuilder(); for (byte x : b) s.append(String.format("%02x", x)); return s.toString(); }
}
