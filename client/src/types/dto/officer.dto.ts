export const RANKS = [
  'Warden',
  'Deputy Warden',
  'Chief Jailer',
  'Captain',
  'Lieutenant',
  'Sergeant',
  'Corporal',
  'Guard',
  'Trainee',
] as const

export type Rank = (typeof RANKS)[number]

export const GENDERS = ['M', 'F', 'Other', 'Undisclosed'] as const
export type Gender = (typeof GENDERS)[number]

export interface OfficerOption {
  id: number
  code: number
  rank: string
  firstName: string
  lastName: string
}

export interface Officer {
  id: number
  code: number
  rank: Rank
  gender: Gender
  personId: number
  firstName: string
  lastName: string
}

export interface CreateOfficerDto {
  personId: number
  code: number
  rank: Rank
  gender: Gender
}

export type UpdateOfficerDto = Partial<CreateOfficerDto>
