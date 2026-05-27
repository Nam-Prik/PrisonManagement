export type IrregularityType =
  | 'MissingPrisoner'
  | 'ItemLost'
  | 'ProhibitedItem'
  | 'ContrabandFound'
  | 'Assault'
  | 'RiotAttempt'
  | 'Vandalism'
  | 'EscapeAttempt'
  | 'MedicalEmergency'

export type Severity = 'None' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Fatal'

export interface IrregularityRow {
  id: number
  description: string | null
  severity: Severity
  type: IrregularityType
}

export interface Irregularity {
  id: number
  description: string | null
  severity: Severity
  type: IrregularityType
}

export const toIrregularity = (row: IrregularityRow): Irregularity => ({
  id: row.id,
  description: row.description,
  severity: row.severity,
  type: row.type,
})
