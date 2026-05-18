export interface CreatePrisonerDto {
  personId: number
  evaluation?: string
}

export interface UpdatePrisonerDto {
  evaluation?: string
}

export interface CreatePrisonerWithPersonDto {
  firstName: string
  lastName: string
  identificationNo?: string
  gender: string
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: string
  evaluation?: string
}

export interface PrisonerListItem {
  id: number
  code: string
  identificationNo: string | null
  firstName: string
  lastName: string
  age: number
  evaluation: string | null
  evaluationScore: number | null
  hasMugshot: boolean
}

export interface PrisonerDetail {
  id: number
  code: string
  personId: number
  identificationNo: string | null
  firstName: string
  lastName: string
  gender: string
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: string
  evaluation: string | null
  evaluationScore: number | null
  mugshotImgKey: string | null
  prisonIntakeId: number | null
}
