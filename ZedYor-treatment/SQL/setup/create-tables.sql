-- -----------------------------------------------------
-- Define Custom ENUM Types for PostgreSQL
-- -----------------------------------------------------
CREATE TYPE visitor_relation_enum AS ENUM (
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Spouse',
    'Child',
    'Relative',
    'Friend',
    'Legal Counsel',
    'Official',
    'Other'
);

CREATE TYPE gender_enum AS ENUM (
    'M', 
    'F', 
    'Other', 
    'Undisclosed'
);

CREATE TYPE blood_enum AS ENUM (
    'A+', 'A-', 
    'B+', 'B-', 
    'AB+', 'AB-', 
    'O+', 'O-', 
    'Unknown'
);

CREATE TYPE health_status_enum AS ENUM (
    'Cleared', 
    'Routine Follow-up', 
    'Observation', 
    'Quarantined', 
    'Hospitalized', 
    'Critical',
    'Deceased'
);

CREATE TYPE severity_enum AS ENUM (
    'None',
    'Low', 
    'Medium', 
    'High', 
    'Critical',
    'Fatal'
);

CREATE TYPE irregularity_type_enum AS ENUM (
    'MissingPrisoner', 
    'ItemLost', 
    'ProhibitedItem', 
    'ContrabandFound',
    'Assault',
    'RiotAttempt',
    'Vandalism',
    'EscapeAttempt',
    'MedicalEmergency'
);

CREATE TYPE rank_enum AS ENUM (
    'Warden', 
    'Deputy Warden',
    'Chief Jailer', 
    'Captain',
    'Lieutenant',
    'Sergeant',
    'Corporal',
    'Guard',
    'Trainee'
);

CREATE TYPE maintenance_skill_enum AS ENUM (
    'Plumbing', 
    'Electrical', 
    'HVAC', 
    'Carpentry',
    'Masonry',
    'Welding',
    'Locksmithing',
    'Painting',
    'General Maintenance'
);

CREATE TYPE specialization_enum AS ENUM (
    'K9 Handler',
    'Riot Control',
    'Crisis Negotiator',
    'Transport Officer',
    'Gang Intelligence',
    'Armory Manager',
    'Narcotics Detection',
    'First Aid Responder'
);

CREATE TYPE routine_enum AS ENUM (
    'Patrol', 
    'Guard Post', 
    'Inspection',
    'Inmate Escort',
    'Cell Search',
    'Tower Watch',
    'Recreation Supervision',
    'Cafeteria Duty',
    'Perimeter Check'
);

CREATE TYPE maint_status_enum AS ENUM (
    'Reported',
    'Pending Approval',
    'Scheduled',
    'In progress', 
    'On Hold',
    'Done',
    'Cancelled'
);

-- -----------------------------------------------------
-- Base Tables (No Foreign Keys)
-- -----------------------------------------------------

CREATE TABLE Person (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    identification_no VARCHAR(255) UNIQUE,
    gender gender_enum NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_no VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    date_of_birth DATE NOT NULL,
    blood_type blood_enum NOT NULL
);

CREATE TABLE PrisonLocation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    max_capacity INT NOT NULL
);

CREATE TABLE Medicine (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    code INT UNIQUE NOT NULL,
    caution VARCHAR(255) NOT NULL
);

CREATE TABLE PrisonerIntake (
    id SERIAL PRIMARY KEY,
    intake_date TIMESTAMP NOT NULL,
    initial_health_status health_status_enum NOT NULL
);

CREATE TABLE Irregularity (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    severity severity_enum NOT NULL,
    type irregularity_type_enum NOT NULL
);

-- -----------------------------------------------------
-- Level 1 Tables (Depend on Base Tables)
-- -----------------------------------------------------

CREATE TABLE Document (
    id SERIAL PRIMARY KEY,
    person_id INT UNIQUE NOT NULL,
    national_id_number INT UNIQUE,
    national_id_file_key VARCHAR(255) UNIQUE NULL, 
    house_registration_number INT UNIQUE,
    house_registration_file_key VARCHAR(255) UNIQUE NULL,
    birth_certificate_number INT UNIQUE,
    birth_certificate_file_key VARCHAR(255) UNIQUE NULL,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

CREATE TABLE Nurse (
    id SERIAL PRIMARY KEY,
    gender gender_enum NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    person_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

CREATE TABLE Officer (
    id SERIAL PRIMARY KEY,
    gender gender_enum NOT NULL,
    code INT UNIQUE NOT NULL,
    rank rank_enum NOT NULL,
    person_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

CREATE TABLE Maintainer (
    id SERIAL PRIMARY KEY,
    person_id INT NOT NULL,
    maintainance_skill maintenance_skill_enum NOT NULL,
    skill_description TEXT,
    company_name VARCHAR(255) NOT NULL,
    specialization specialization_enum NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

CREATE TABLE Prisoner (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    person_id INT UNIQUE NOT NULL,
    mugshot_img_key VARCHAR(255) UNIQUE NULL, 
    evaluation VARCHAR(255), 
    evaluation_score INT,
    prison_intake_id INT NOT NULL,
    FOREIGN KEY (person_id) REFERENCES Person(id),
    FOREIGN KEY (prison_intake_id) REFERENCES PrisonerIntake(id)
);

-- -----------------------------------------------------
-- Level 2 Tables 
-- -----------------------------------------------------

-- Renamed to ConfiscatedItem per your request
CREATE TABLE ConfiscatedItem (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    remarks VARCHAR(255) NOT NULL,
    PrisonerIntake_id INT NOT NULL,
    FOREIGN KEY (PrisonerIntake_id) REFERENCES PrisonerIntake(id)
);

CREATE TABLE RoutinesSchedule (
    id SERIAL PRIMARY KEY,
    routine_name VARCHAR(255) NOT NULL,
    prison_location_id INT NOT NULL,
    routines_schedule_date DATE NOT NULL,
    type routine_enum NOT NULL,
    FOREIGN KEY (prison_location_id) REFERENCES PrisonLocation(id)
);

CREATE TABLE Visitment (
    id SERIAL PRIMARY KEY,
    prisoner_id INT NOT NULL,
    visitment_date DATE NOT NULL,
    description VARCHAR(255),
    status VARCHAR(50) CHECK (status IN ('scheduled', 'completed', 'cancelled')) NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (prisoner_id) REFERENCES Prisoner(id)
);

CREATE TABLE Treatment (
    id SERIAL PRIMARY KEY,
    prisoner_id INT NOT NULL,
    nurse_id INT NOT NULL,
    description VARCHAR(255),
    diagnose_date DATE NOT NULL,
    FOREIGN KEY (prisoner_id) REFERENCES Prisoner(id),
    FOREIGN KEY (nurse_id) REFERENCES Nurse(id)
);

CREATE TABLE Maintainance (
    id SERIAL PRIMARY KEY,
    prison_location_id INT NOT NULL,
    maintainance_date DATE NOT NULL,
    maintainance_cost INT NOT NULL,
    status maint_status_enum NOT NULL,
    FOREIGN KEY (prison_location_id) REFERENCES PrisonLocation(id)
);

CREATE TABLE PrisonerIncidents (
    id SERIAL PRIMARY KEY,
    incident_datetime TIMESTAMP NOT NULL,
    description VARCHAR(255),
    prison_location_id INT NOT NULL,
    reporting_officer_id INT NOT NULL,
    FOREIGN KEY (prison_location_id) REFERENCES PrisonLocation(id),
    FOREIGN KEY (reporting_officer_id) REFERENCES Officer(id)
);

-- -----------------------------------------------------
-- Level 3 Tables 
-- -----------------------------------------------------

CREATE TABLE RoutinesOfficer (
    id SERIAL PRIMARY KEY,
    officer_id INT NOT NULL,
    routine_id INT NOT NULL,
    FOREIGN KEY (officer_id) REFERENCES Officer(id),
    FOREIGN KEY (routine_id) REFERENCES RoutinesSchedule(id)
);

CREATE TABLE Inspection (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    routine_id INT UNIQUE NOT NULL, 
    FOREIGN KEY (routine_id) REFERENCES RoutinesSchedule(id)
);

CREATE TABLE Labor (
    maintainance_id INT NOT NULL,
    maintainer_id INT NOT NULL,
    labor_task VARCHAR(255) NOT NULL,
    PRIMARY KEY (maintainance_id, maintainer_id),
    FOREIGN KEY (maintainance_id) REFERENCES Maintainance(id),
    FOREIGN KEY (maintainer_id) REFERENCES Maintainer(id)
);

CREATE TABLE InvolvedPrisoner (
    prisoner_incicent_id INT NOT NULL,
    prisoner_id INT NOT NULL,
    PRIMARY KEY (prisoner_incicent_id, prisoner_id),
    FOREIGN KEY (prisoner_incicent_id) REFERENCES PrisonerIncidents(id),
    FOREIGN KEY (prisoner_id) REFERENCES Prisoner(id)
);

CREATE TABLE MedicationPrescription (
    id SERIAL PRIMARY KEY,
    treatment_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage INT NOT NULL,
    frequency INT NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (treatment_id) REFERENCES Treatment(id),
    FOREIGN KEY (medicine_id) REFERENCES Medicine(id)
);

-- -----------------------------------------------------
-- Level 4 Tables
-- -----------------------------------------------------

CREATE TABLE VisitmentLineItem (
    visitment_id INT NOT NULL,
    person_id INT NOT NULL,
    relation visitor_relation_enum NOT NULL, -- New column added here
    PRIMARY KEY (visitment_id, person_id),
    FOREIGN KEY (visitment_id) REFERENCES Visitment(id),
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

CREATE TABLE InspectionResult (
    inspection_id INT NOT NULL,
    found_irregularity_id INT NOT NULL,
    result_description VARCHAR(255) NOT NULL,
    PRIMARY KEY (inspection_id, found_irregularity_id),
    FOREIGN KEY (inspection_id) REFERENCES Inspection(id),
    FOREIGN KEY (found_irregularity_id) REFERENCES Irregularity(id)
);