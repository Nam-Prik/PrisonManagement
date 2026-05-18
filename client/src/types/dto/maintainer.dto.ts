/** Maintainer data used in LOV pickers and line-item drafts */
export interface MaintainerOption {
  id: number
  firstName: string
  lastName: string
  maintenanceSkill: string
  skillDescription: string | null
  companyName: string
  specialization: string
}
