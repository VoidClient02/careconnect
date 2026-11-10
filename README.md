# CareConnect Hospital & Telehealth Platform (prototype)

**Frontend:** React 18 + Vite (`frontend/`) · **Backend:** Java 11 Servlets JSON API (`backend/`, Tomcat 9 WAR) · **DB:** MySQL 8
Roles: Patient (login/sign-up), Doctor (16 specialties), Nurse, Paramedic, Pharmacy.

## Fastest start (Windows terminal; needs only JDK 17 + Node 18+)
```
.\run.cmd              # build UI if needed, download Maven if needed, start embedded DB + Tomcat
.\run.cmd -RebuildUI   # same, but rebuild the React UI first
.\run.cmd -Stop        # stop a leftover embedded database
```
Open http://localhost:8080/careconnect/  - Ctrl+C stops it. If PowerShell blocks `npm`, run:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Quick start (everything inside the project - nothing to install except JDK 11+, Maven and Node 18+)
The project bundles its own **embedded Tomcat 9** and an **embedded MySQL-compatible database (MariaDB)**.
Data lives in `backend/dev-data/`; tables and demo accounts are created automatically from `database/schema.sql`.

1. Open the `careconnect` folder in VS Code (accept the recommended extensions: Java pack).
2. Press **F5** and choose **"CareConnect: embedded Tomcat + DB"**.
   (First run: builds the React UI, downloads the DB binaries via Maven, starts everything. Takes a few minutes once.)
3. Open http://localhost:8080/careconnect/ and log in with a demo account below.
4. Stop with the red square in the debug bar. To reset the database, stop and delete `backend/dev-data/db`.

No debugger? Run the task **"Run dev server (terminal alternative)"** (Terminal > Run Task) instead.
Linux only: the embedded DB needs `libaio1` and `libncurses5` (`sudo apt install libaio1 libncurses5`).
Ports used: 8080 (web, change with `-Dport=9090`) and 3307 (database).

## Later: real Tomcat + real MySQL
1. `mysql -u root -p < database/schema.sql`, then set credentials in `backend/src/main/resources/db.properties`
2. Ctrl+Shift+B -> "Build all (UI + WAR)" -> deploy `backend/target/careconnect.war` to **Tomcat 9** (not 10+).
The embedded DB/Tomcat libraries are `provided`-scope and are NOT packaged in the WAR.

## Frontend dev mode (hot reload)
Keep the dev server running (F5), then `cd frontend && npm run dev` and open http://localhost:5173/careconnect/ui/
(API calls are proxied to Tomcat). If you deploy under a different context path, set `VITE_API` and `base` in `vite.config.js`.

## Demo accounts (password for all: `Pass1234!`)
patient@ · gp@ (also cardio@, paeds@, surgeon@, gyn@, neuro@, er@) · nurse@ · paramedic@ · pharmacy@  — all `@careconnect.test`

## API (JSON, session cookie + `X-CSRF-Token` header on writes)
`POST /api/auth/login|signup|logout` · `GET /api/auth/me` · `GET /api/dashboard` (role-specific data) ·
`POST /api/appointments/book|status` · `/api/prescriptions/create|dispense` · `/api/vitals/record` · `/api/emergency/log`

## Prototype limits
Salted SHA-256 (use BCrypt/Argon2) · no HTTPS · DriverManager (use a pool) · staff self-register (add admin approval) · no audit log.
