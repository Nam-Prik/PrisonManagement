-- Report 1: Visitor-Prisoner Relationship Summary
-- by Suwiwat

SELECT
    p.first_name AS visitor_first_name,
    p.last_name AS visitor_last_name,
    p.gender,
    p.contact_no,
    p.blood_type,
    pr.code AS prisoner_code,
    COUNT(v.id) AS total_visits
FROM Person p
JOIN VisitmentLineItem vli
    ON vli.person_id = p.id
JOIN Visitment v
    ON v.id = vli.visitment_id
JOIN Prisoner pr
    ON pr.id = v.prisoner_id
GROUP BY
    p.id, p.first_name, p.last_name, p.gender, p.contact_no, p.blood_type, pr.code
ORDER BY total_visits DESC, p.first_name, p.last_name;