create temporary table total_maintainance as
select
  ma.prison_location_id as prison_location_id,
  ma.status as status,
  sum(ma.maintainance_cost) as total_cost,
  count(l.labor_task) as total_tasks
from maintainance ma
join labor l on ma.id = l.maintainance_id
where ma.status = 'Done' and ma.maintainance_date >= '2023-12-01' and ma.maintainance_date <= '2023-12-23'
group by ma.prison_location_id, ma.status;

select
  pl.name as location_name,
  pl.code as location_code,
  tm.total_tasks,
  tm.total_cost,
  tm.status
from total_maintainance tm
join prisonlocation pl on pl.id = tm.prison_location_id