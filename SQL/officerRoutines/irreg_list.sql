-- Author: Peeranat Ngamkiatkajorn 67070503429
-- Simple QUERY
-- Lists all irregularities found during inspections within a given date range,
-- tracing each finding back to its scheduled routine, prison location, and inspection record.
-- Output includes Inspection Date, Location Name, Irregularity Type, Irregularity Description,
-- Specific Findings, and Inspection Reasons.

CREATE OR REPLACE FUNCTION list_irregularities(
    p_date_start date,
    p_date_end date
) RETURNS TABLE (
    "Inspection Date" date,
    "Location Name" text,
    "Irregularity Type" text,
    "Irregularity Description" text,
    "Specific Findings" text,
    "Inspection Reasons" text
)
LANGUAGE sql STABLE AS
$$
SELECT
    rs.routines_schedule_date AS "Inspection Date",
    pl.name AS "Location Name",
    ir.type AS "Irregularity Type",
    ir.description AS "Irregularity Description",
    irr.result_description AS "Specific Findings",
    i.reason AS "Inspection Reasons"
FROM routinesschedule rs
JOIN prisonlocation pl ON rs.prison_location_id = pl.id
JOIN inspection i ON i.routine_id = rs.id
JOIN inspectionresult irr ON irr.inspection_id = i.id
JOIN irregularity ir ON ir.id = irr.found_irregularity_id
WHERE rs.routines_schedule_date BETWEEN p_date_start AND p_date_end
ORDER BY rs.routines_schedule_date
$$;

SELECT * FROM list_irregularities('2026-03-22', '2026-3-25');