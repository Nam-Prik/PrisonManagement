export interface PrisonLocation {
  id: number
  name: string
  code: string
  purpose: string
  maxCapacity: number
}

export interface CreatePrisonLocationDto {
  name: string
  code: string
  purpose: string
  maxCapacity: number
}

export type UpdatePrisonLocationDto = Partial<CreatePrisonLocationDto>
