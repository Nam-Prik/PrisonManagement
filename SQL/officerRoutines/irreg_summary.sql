-- Author: Peeranat Ngamkiatkajorn 67070503429
-- Analysis Query
-- Aggregates irregularities found during inspections within a given date range,
-- grouped by year, month, and irregularity type to reveal seasonal trends or spikes
-- in specific issues (e.g. an increase in prohibited items during certain months).
-- Output includes Inspection Year, Inspection Month, Irregularity Type, and Total Incidents.

CREATE OR REPLACE FUNCTION irregularities_summary(
    p_date_start date,
    p_date_end date
)
RETURNS TABLE (
    "Inspection Year" numeric,
    "Inspection Month" numeric,
    "Irregularity Type" text,
    "Total Incidents" numeric
)
LANGUAGE sql STABLE AS
$$
SELECT
    EXTRACT(YEAR FROM rs.routines_schedule_date) AS "Inspection Year",
    EXTRACT(MONTH FROM rs.routines_schedule_date) AS "Inspection Month",
    ir.type AS "Irregularity Type",
    COUNT(*) AS "Total Incidents"
FROM routinesschedule rs
JOIN inspection i ON i.routine_id = rs.id
JOIN inspectionresult irr ON irr.inspection_id = i.id
JOIN irregularity ir ON ir.id = irr.found_irregularity_id
WHERE rs.routines_schedule_date BETWEEN p_date_start AND p_date_end
GROUP BY
    EXTRACT(YEAR FROM rs.routines_schedule_date),
    EXTRACT(MONTH FROM rs.routines_schedule_date),
    ir.type
ORDER BY "Inspection Year", "Inspection Month", ir.type;
$$;

SELECT * FROM irregularities_summary('2026-03-22', '2026-03-25')
