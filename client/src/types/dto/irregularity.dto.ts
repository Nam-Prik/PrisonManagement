export const IRREGULARITY_TYPES = [
  'MissingPrisoner',
  'ItemLost',
  'ProhibitedItem',
  'ContrabandFound',
  'Assault',
  'RiotAttempt',
  'Vandalism',
  'EscapeAttempt',
  'MedicalEmergency',
] as const

export type IrregularityType = (typeof IRREGULARITY_TYPES)[number]

export const SEVERITIES = ['None', 'Low', 'Medium', 'High', 'Critical', 'Fatal'] as const
export type Severity = (typeof SEVERITIES)[number]

export interface Irregularity {
  id: number
  type: IrregularityType
  description: string | null
  severity: Severity
}

export interface CreateIrregularityDto {
  type: IrregularityType
  description?: string
  severity: Severity
}

export type UpdateIrregularityDto = Partial<CreateIrregularityDto>
