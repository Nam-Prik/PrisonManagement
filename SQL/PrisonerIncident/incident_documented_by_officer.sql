-- Simple QUERY
-- Listing all incidents documented by a specific officer, including details about the incident, location, and involved prisoners.
-- Output includes Incident ID, Datetime, Description, Location Name, and details of involved prisoners (if any).

create or replace function list_incidents_by_officer(
 target_officer_id int
) returns table (
 "Incident ID" int, 
 "Incident Datetime" date, 
 "Description" text,
 "Days Since Incident" int,
 "Location Name" text,
 "Prisoner Code" text,
 "Prisoner First Name" text,
 "Prisoner Last Name" text
) 
language sql stable as
$$
select pi.id as "Incident ID",
       pi.incident_datetime as "Incident Datetime",
       pi.description as "Description",
       EXTRACT(DAYS FROM (CURRENT_DATE - pi.incident_datetime)) as "Days Since Incident",
       pl.name as "Location Name",
       p.code as "Prisoner Code",
       pr.first_name as "Prisoner First Name",
       pr.last_name as "Prisoner Last Name"
from PrisonerIncidents pi
join PrisonLocation pl on pi.prison_location_id = pl.id
left join InvolvedPrisoner ip on pi.id = ip.prisoner_incicent_id
left join Prisoner p on ip.prisoner_id = p.id
left join Person pr on p.person_id = pr.id
where pi.reporting_officer_id = target_officer_id
order by pi.incident_datetime DESC;
$$;

-- Replace '4' with the actual Reporting Officer ID
SELECT * from list_incidents_by_officer(4);