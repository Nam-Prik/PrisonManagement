export interface PrisonerOption {
  id: number
  code: string
  firstName: string
  lastName: string
  evaluationScore: number | null
}

export interface PrisonerDetail {
  id: number
  code: string
  personId: number
  mugshotImgKey: string | null
  evaluation: string | null
  evaluationScore: number | null
  prisonIntakeId: number
  firstName: string
  lastName: string
}

export interface CreatePrisonerDto {
  personId: number
  prisonIntakeId: number
  code: string
  mugshotImgKey?: string
  evaluation?: string
  evaluationScore?: number
}

export interface UpdatePrisonerDto {
  code?: string
  mugshotImgKey?: string
  evaluation?: string
  evaluationScore?: number
}
