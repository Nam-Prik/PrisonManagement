-- Analysis Query
-- This query showing the prisoner with the most incidents at each location, along with the total number of incidents they were involved in at that location during the specified date range.
-- Output includes Location Name, Prisoner Code, First Name, Last Name, and Total Incidents. 

create or replace function top_prisoner_incidents_by_location(
 start_date date,
 end_date date
) returns table (
 "Location Name" text,
 "Prisoner Code" text,
 "Prisoner First Name" text,
 "Prisoner Last Name" text,
 "Total Actions Taken" int
) 
language sql stable as
$$
select distinct on (pl.name) 
       pl.name as "Location Name",
       pr.code as "Prisoner Code",
       p.first_name as "Prisoner First Name",
       p.last_name as "Prisoner Last Name",
       count(pi.id) as "Total Actions Taken"
from PrisonLocation pl
join PrisonerIncidents pi on pl.id = pi.prison_location_id
left join InvolvedPrisoner ip on pi.id = ip.prisoner_incicent_id
left join Prisoner pr on ip.prisoner_id = pr.id
left join Person p on pr.person_id = p.id
where pi.incident_datetime between start_date and end_date
group by pl.name, pr.code, p.first_name, p.last_name
order by pl.name, "Total Actions Taken" DESC;
$$;

SELECT * from top_prisoner_incidents_by_location('2025-01-01', '2026-12-31');