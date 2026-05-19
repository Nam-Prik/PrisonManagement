export interface CreateVisitmentDto {
  prisonerId: number
  visitmentDate: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  description?: string
  visitors: CreateVisitmentVisitorDto[]
}

export interface CreateVisitmentVisitorDto {
  personId: number
  relation: string
}

export interface UpdateVisitmentDto extends Partial<CreateVisitmentDto> {}
