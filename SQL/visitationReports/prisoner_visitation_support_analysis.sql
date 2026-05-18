-- Report 3: Prisoner Visitation Support Analysis
-- by Suwiwat

WITH visit_stats AS (
    SELECT
        v.prisoner_id,
        COUNT(*) AS total_completed_visits,
        SUM(v.duration) AS total_visitation_duration,       
        ROUND(AVG(v.duration), 2) AS avg_duration_per_visit
    FROM Visitment v
    WHERE v.status = 'completed'
    GROUP BY v.prisoner_id
),
visitor_stats AS (
    SELECT
        v.prisoner_id,
        COUNT(DISTINCT vli.person_id) AS unique_visitor_count
    FROM Visitment v
    JOIN VisitmentLineItem vli
        ON vli.visitment_id = v.id
    WHERE v.status = 'completed'
    GROUP BY v.prisoner_id
)
SELECT
    pr.code AS prisoner_code,
    pe.first_name AS prisoner_first_name,
    pe.last_name AS prisoner_last_name,
    pr.evaluation_score,
    COALESCE(vs.total_completed_visits, 0) AS total_completed_visits,
    COALESCE(vs.total_visitation_duration, 0) AS total_visitation_duration,
    COALESCE(vs.avg_duration_per_visit, 0) AS avg_duration_per_visit,
    COALESCE(vst.unique_visitor_count, 0) AS unique_visitor_count
FROM Prisoner pr
JOIN Person pe
    ON pe.id = pr.person_id
LEFT JOIN visit_stats vs
    ON vs.prisoner_id = pr.id
LEFT JOIN visitor_stats vst
    ON vst.prisoner_id = pr.id
ORDER BY total_visitation_duration DESC, unique_visitor_count DESC;