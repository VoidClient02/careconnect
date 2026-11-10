CREATE DATABASE IF NOT EXISTS careconnect CHARACTER SET utf8mb4;
USE careconnect;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  salt VARCHAR(32) NOT NULL,
  password_hash CHAR(64) NOT NULL,
  role ENUM('PATIENT','DOCTOR','NURSE','PARAMEDIC','PHARMACIST') NOT NULL,
  specialty VARCHAR(60),
  license_no VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL, doctor_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  mode ENUM('IN_PERSON','VIRTUAL') NOT NULL DEFAULT 'IN_PERSON',
  reason VARCHAR(255) NOT NULL,
  status ENUM('REQUESTED','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  FOREIGN KEY (patient_id) REFERENCES users(id), FOREIGN KEY (doctor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL, doctor_id INT NOT NULL,
  medication VARCHAR(120) NOT NULL, dosage VARCHAR(120) NOT NULL, instructions VARCHAR(255),
  status ENUM('PENDING','DISPENSED') NOT NULL DEFAULT 'PENDING',
  dispensed_by INT NULL, dispensed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id), FOREIGN KEY (doctor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS vitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL, nurse_id INT NOT NULL,
  bp VARCHAR(10), temperature DECIMAL(4,1), pulse INT, notes VARCHAR(255),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id), FOREIGN KEY (nurse_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS emergency_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paramedic_id INT NOT NULL,
  patient_name VARCHAR(100) NOT NULL, location VARCHAR(160) NOT NULL, condition_desc VARCHAR(255) NOT NULL,
  priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paramedic_id) REFERENCES users(id)
);

-- Demo accounts. Password for ALL: Pass1234!   (hash = SHA-256(salt + password), same as the Java code)
INSERT IGNORE INTO users(full_name,email,salt,password_hash,role,specialty) VALUES
('Dr. Amina Dlamini','gp@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','General Practitioner'),
('Dr. Sipho Nkosi','cardio@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','Cardiologist'),
('Dr. Thandi Mokoena','paeds@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','Pediatrician'),
('Dr. Pieter van Wyk','surgeon@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','Surgeon'),
('Dr. Lerato Sithole','gyn@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','Gynecologist'),
('Dr. Kabelo Molefe','neuro@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','Neurologist'),
('Dr. Zanele Dube','er@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'DOCTOR','Emergency Medicine'),
('Nurse Grace Mahlangu','nurse@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'NURSE',NULL),
('Paramedic Tau Mabena','paramedic@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'PARAMEDIC',NULL),
('Pharmacist Neo Radebe','pharmacy@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'PHARMACIST',NULL),
('Demo Patient','patient@careconnect.test','seed',SHA2(CONCAT('seed','Pass1234!'),256),'PATIENT',NULL);
