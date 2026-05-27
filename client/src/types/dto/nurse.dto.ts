export const GENDERS = ['M', 'F', 'Other', 'Undisclosed'] as const
export type Gender = (typeof GENDERS)[number]

export interface Nurse {
  id: number
  code: string
  gender: Gender
  personId: number
  firstName: string
  lastName: string
}

export interface CreateNurseDto {
  personId: number
  code: string
  gender: Gender
}

export type UpdateNurseDto = Partial<CreateNurseDto>
