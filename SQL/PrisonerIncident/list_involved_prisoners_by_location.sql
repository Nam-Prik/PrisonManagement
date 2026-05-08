-- Simple QUERY
-- Listing all prisoners involved in incidents at a specific location, including their details and the datetime of the incident.
-- Output includes Prisoner Code, First Name, Last Name, and Incident Datetime.

create or replace function list_involved_prisoners_by_location(
 target_location_id int
) returns table (
 "Prisoner Code" text,
 "Prisoner First Name" text,
 "Prisoner Last Name" text,
 "Incident Datetime" date,
 "Evaluation Score" int,
 "Risk Alert" text,
 "Days Ago" int
) 
language sql stable as
$$
select p.code as "Prisoner Code",
       pr.first_name as "Prisoner First Name",
       pr.last_name as "Prisoner Last Name",
       pi.incident_datetime as "Incident Datetime",
       p.evaluation_score as "Evaluation Score",
       CASE 
           WHEN p.evaluation_score < 40 THEN 'High Risk / Requires Escort'
           WHEN p.evaluation_score BETWEEN 40 AND 75 THEN 'Monitor closely'
           ELSE 'Standard Protocol'
       END as "Risk Alert",
       EXTRACT(DAYS FROM (CURRENT_DATE - pi.incident_datetime)) as "Days Ago"
from Prisoner p
join InvolvedPrisoner ip on p.id = ip.prisoner_id
join PrisonerIncidents pi on ip.prisoner_incicent_id = pi.id
join PrisonLocation pl on pi.prison_location_id = pl.id
join Person pr on p.person_id = pr.id
where pl.id = target_location_id
order by pi.incident_datetime DESC;
$$;

-- Replace '10' with the actual Prison Location ID you want to query
SELECT * from list_involved_prisoners_by_location(10);