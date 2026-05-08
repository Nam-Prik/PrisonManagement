-- Author: Peeranat Ngamkiatkajorn 67070503429
-- Simple QUERY
-- Lists all scheduled routines and their assigned locations for each officer,
-- allowing officers to know where they should be and at what time.
-- Accepts an optional officer code filter; defaults to '*' which returns all officers.
-- Output includes Officer Code, Officer Name, Schedule Date, Routine Name, Routine Type, and Location Name.

CREATE OR REPLACE FUNCTION get_officer_routines(
    p_officer_code text DEFAULT '*'
) RETURNS TABLE (
    "Officer Code" text,
    "Officer Name" text,
    "Schedule Date" date,
    "Routine Name" text,
    "Routine Type" text,
    "Location Name" text
)
LANGUAGE sql STABLE AS
$$
SELECT
    o.code AS "Officer Code",
    CONCAT(p.first_name, ' ', p.last_name) AS "Officer Name",
    rs.routines_schedule_date AS "Schedule Date",
    rs.routine_name AS "Routine Name",
    rs.type AS "Routine Type",
    pl.name AS "Location Name"
FROM officer o
JOIN person p ON p.id = o.person_id
JOIN routinesofficer ro ON ro.officer_id = o.id
JOIN routinesschedule rs ON rs.id = ro.routine_id
JOIN prisonlocation pl ON pl.id = rs.prison_location_id
WHERE p_officer_code = '*' OR o.code::text = p_officer_code
ORDER BY o.code, rs.routines_schedule_date
$$;

SELECT * FROM get_officer_routines();