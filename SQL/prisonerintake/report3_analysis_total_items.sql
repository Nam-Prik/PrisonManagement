-- Author: Phurithip Paisanwaorajit 67070503437

-- Analysis QUERY
-- Filter by date and limit results using Top N

create or replace function total_confiscated_items_per_intake(
    from_date date,
    to_date date,
    top_n int
)
returns table (
    "Intake ID" int,
    "Prisoner Code" text,
    "Intake Date" date,
    "Total Items" int
)
language sql stable as
$$
select 
    pi.id,
    p.code,
    pi.intake_date,
    sum(ci.quantity) as total_items
from confiscateditem ci
join prisonerintake pi on ci.prisonerintake_id = pi.id
join prisoner p on p.prison_intake_id = pi.id
where pi.intake_date between from_date and to_date
group by pi.id, p.code, pi.intake_date
-- order by highest total items first
order by total_items desc
--  limit results to top N (e.g. top 10)
limit top_n;
$$;

-- get top 10 intakes
select * from total_confiscated_items_per_intake('2021-01-01','2023-12-31', 10);