-- Author: Phurithip Paisanwaorajit 67070503437

-- Simple QUERY
-- Filter by date range and prisoner code

create or replace function list_prisoner_intakes(
    from_date date,
    to_date date,
    prisoner_code text
)
returns table (
    "Prisoner Code" text,
    "Prisoner Name" text,
    "Intake Date" date,
    "Initial Health Status" text
)
language sql stable as
$$
select 
    p.code,
    pe.first_name || ' ' || pe.last_name,
    pi.intake_date,
    pi.initial_health_status
from prisoner p
join person pe on p.person_id = pe.id
join prisonerintake pi on p.prison_intake_id = pi.id
where pi.intake_date between from_date and to_date
-- show only specific prisoner if code is given
and (p.code = prisoner_code or prisoner_code is null)
order by pi.intake_date desc;
$$;

--  records(no specific prisoner)
select * from list_prisoner_intakes('2021-01-01','2023-12-31', null);