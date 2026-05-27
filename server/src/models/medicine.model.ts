export interface MedicineRow {
  id: number
  name: string
  generic_name: string | null
  code: number
  caution: string
}

export interface Medicine {
  id: number
  name: string
  genericName: string | null
  code: number
  caution: string
}

export const toMedicine = (row: MedicineRow): Medicine => ({
  id: row.id,
  name: row.name,
  genericName: row.generic_name,
  code: row.code,
  caution: row.caution,
})
