--67070503432 Praewa Thuwatharanimitkul
--Find all nurse workloads in percentage and select to show only top 5
--For assigning nurse workload in the future
SELECT pe.first_name as "Nurse First Name", 
pe.last_name as "Nurse Last Name", 
ROUND(COUNT(*) * 100 / SUM(COUNT(*)) OVER(),2) as "Nurse Workload Percentage" 
FROM treatment t 
JOIN nurse n on n.id=t.nurse_id
JOIN person pe on pe.id = n.person_id
GROUP BY pe.first_name,pe.last_name
ORDER BY "Nurse Workload Percentage" desc, pe.first_name asc, pe.last_name asc
LIMIT 5;
