import type { CreatePrisonerDto, UpdatePrisonerDto } from '../dto/prisoner.dto.js'
import type { PrisonerDetail, PrisonerOption } from '../models/prisoner.model.js'
import { toPrisonerOption } from '../models/prisoner.model.js'
import type { PrisonerDetailRow } from '../repositories/prisoner.repository.js'
import { prisonerRepository } from '../repositories/prisoner.repository.js'

function toDetail(row: PrisonerDetailRow): PrisonerDetail {
  return {
    id: row.id,
    code: row.code,
    personId: row.person_id,
    mugshotImgKey: row.mugshot_img_key,
    evaluation: row.evaluation,
    evaluationScore: row.evaluation_score != null ? Number(row.evaluation_score) : null,
    prisonIntakeId: row.prison_intake_id,
    firstName: row.first_name,
    lastName: row.last_name,
  }
}

export const prisonerService = {
  async getAll(): Promise<PrisonerOption[]> {
    const rows = await prisonerRepository.findAll()
    return rows.map(toPrisonerOption)
  },

  async getById(id: number): Promise<PrisonerDetail | null> {
    const row = await prisonerRepository.findById(id)
    return row ? toDetail(row) : null
  },

  async create(dto: CreatePrisonerDto): Promise<PrisonerDetail> {
    const row = await prisonerRepository.create(dto)
    return toDetail(row)
  },

  async update(id: number, dto: UpdatePrisonerDto): Promise<PrisonerDetail | null> {
    const row = await prisonerRepository.update(id, dto)
    return row ? toDetail(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return prisonerRepository.delete(id)
  },
}
