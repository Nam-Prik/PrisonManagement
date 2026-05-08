-- Author: Phurithip Paisanwaorajit 67070503437

-- Simple QUERY
-- Filter by date range and item name

create or replace function list_confiscated_items(
    from_date date,
    to_date date,
    item_filter text
)
returns table (
    "Prisoner Code" text,
    "Intake Date" date,
    "Item Name" text,
    "Quantity" int,
    "Remarks" text
)
language sql stable as
$$
select 
    p.code,
    pi.intake_date,
    ci.item_name,
    ci.quantity,
    ci.remarks
from confiscateditem ci
join prisonerintake pi on ci.prisonerintake_id = pi.id
join prisoner p on p.prison_intake_id = pi.id
where pi.intake_date between from_date and to_date
-- filter by item name (e.g. 'Knife'), or show all if null
and (ci.item_name = item_filter or item_filter is null)
order by pi.intake_date desc, ci.item_name;
$$;

-- show all confiscated items 
select * from list_confiscated_items('2021-01-01','2023-12-31', null);