export const MAINTENANCE_SKILLS = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Carpentry',
  'Masonry',
  'Welding',
  'Locksmithing',
  'Painting',
  'General Maintenance',
] as const

export type MaintenanceSkill = (typeof MAINTENANCE_SKILLS)[number]

export interface MaintainerBySkill {
  firstName: string
  lastName: string
  age: number
}

export interface LaborByCost {
  laborTask: string
  maintainanceCost: number
  firstName: string
  lastName: string
}

export interface CostByLocation {
  locationName: string
  locationCode: string
  totalCost: number
  totalTasks: number
}
