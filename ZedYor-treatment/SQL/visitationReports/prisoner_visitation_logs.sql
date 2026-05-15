-- Report 2: Visitation Logs for Each Prisoner
-- by Suwiwat

SELECT
    pr.code AS prisoner_code,
    v.visitment_date,
    v.duration,
    v.description,
    p.first_name AS visitor_first_name,
    p.last_name AS visitor_last_name
FROM Visitment v
JOIN Prisoner pr
    ON pr.id = v.prisoner_id
JOIN VisitmentLineItem vli
    ON vli.visitment_id = v.id
JOIN Person p
    ON p.id = vli.person_id
ORDER BY pr.code, v.visitment_date DESC;