-- ====================================================================
-- NUCLEAR RESET SCRIPT
-- Warning: This will permanently delete all tables, data, and custom 
-- enum types associated with the prison management database schema.
-- ====================================================================

-- -----------------------------------------------------
-- 1. Drop Level 4 Tables
-- -----------------------------------------------------
DROP TABLE IF EXISTS VisitmentLineItem CASCADE;
DROP TABLE IF EXISTS InspectionResult CASCADE;

-- -----------------------------------------------------
-- 2. Drop Level 3 Tables
-- -----------------------------------------------------
DROP TABLE IF EXISTS RoutinesOfficer CASCADE;
DROP TABLE IF EXISTS Inspection CASCADE;
DROP TABLE IF EXISTS Labor CASCADE;
DROP TABLE IF EXISTS InvolvedPrisoner CASCADE;
DROP TABLE IF EXISTS MedicationPrescription CASCADE;

-- -----------------------------------------------------
-- 3. Drop Level 2 Tables
-- -----------------------------------------------------
DROP TABLE IF EXISTS ConfiscatedItem CASCADE;
DROP TABLE IF EXISTS RoutinesSchedule CASCADE;
DROP TABLE IF EXISTS Visitment CASCADE;
DROP TABLE IF EXISTS Treatment CASCADE;
DROP TABLE IF EXISTS Maintainance CASCADE;
DROP TABLE IF EXISTS PrisonerIncidents CASCADE;

-- -----------------------------------------------------
-- 4. Drop Level 1 Tables
-- -----------------------------------------------------
DROP TABLE IF EXISTS Document CASCADE;
DROP TABLE IF EXISTS Nurse CASCADE;
DROP TABLE IF EXISTS Officer CASCADE;
DROP TABLE IF EXISTS Maintainer CASCADE;
DROP TABLE IF EXISTS Prisoner CASCADE;

-- -----------------------------------------------------
-- 5. Drop Base Tables
-- -----------------------------------------------------
DROP TABLE IF EXISTS Person CASCADE;
DROP TABLE IF EXISTS PrisonLocation CASCADE;
DROP TABLE IF EXISTS Medicine CASCADE;
DROP TABLE IF EXISTS PrisonerIntake CASCADE;
DROP TABLE IF EXISTS Irregularity CASCADE;

-- -----------------------------------------------------
-- 6. Drop Custom ENUM Types
-- -----------------------------------------------------
DROP TYPE IF EXISTS gender_enum CASCADE;
DROP TYPE IF EXISTS blood_enum CASCADE;
DROP TYPE IF EXISTS health_status_enum CASCADE;
DROP TYPE IF EXISTS severity_enum CASCADE;
DROP TYPE IF EXISTS irregularity_type_enum CASCADE;
DROP TYPE IF EXISTS rank_enum CASCADE;
DROP TYPE IF EXISTS maintenance_skill_enum CASCADE;
DROP TYPE IF EXISTS specialization_enum CASCADE;
DROP TYPE IF EXISTS routine_enum CASCADE;
DROP TYPE IF EXISTS maint_status_enum CASCADE;
DROP TYPE IF EXISTS visitor_relation_enum;

-- Reset complete. You have a blank slate!