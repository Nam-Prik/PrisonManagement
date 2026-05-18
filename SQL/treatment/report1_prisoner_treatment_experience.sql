--67070503432 Praewa Thuwatharanimitkul
--Filter prisoner who had a treatment between date 2026-03-22 to 2026-03-26
SELECT diagnose_date as "Diagnose Date", 
pe.first_name as "Prisoner First Name", 
pe.last_name as "Prisoner Last Name",
pne.first_name as "Nurse First Name", 
pne.last_name as "Nurse Last Name", 
description as "Description"
FROM treatment t
--Getting prisoner name
JOIN prisoner p ON p.id = t.prisoner_id
JOIN person pe ON pe.id = p.person_id
--Getting nurse name
JOIN nurse n ON n.id = t.nurse_id
JOIN person pne ON pne.id = n.person_id

WHERE t.diagnose_date >= '2025-03-22' AND t.diagnose_date < '2026-03-26'
ORDER BY diagnose_date desc;