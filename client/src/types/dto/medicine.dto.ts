export interface Medicine {
  id: number
  name: string
  genericName: string | null
  code: number
  caution: string
}

export interface CreateMedicineDto {
  name: string
  genericName?: string
  code: number
  caution: string
}

export type UpdateMedicineDto = Partial<CreateMedicineDto>
