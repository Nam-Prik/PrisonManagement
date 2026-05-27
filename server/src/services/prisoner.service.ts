import type { CreatePrisonerDto, UpdatePrisonerDto } from '../dto/prisoner.dto.js'
import type { PrisonerDetail, PrisonerOption } from '../models/prisoner.model.js'
import { toPrisonerOption } from '../models/prisoner.model.js'
import type { PrisonerDetailRow } from '../repositories/prisoner.repository.js'
import { prisonerRepository } from '../repositories/prisoner.repository.js'
import { getMugshotSignedUrl } from './signurl.js'

function toDetail(row: PrisonerDetailRow): PrisonerDetail {
  return {
    id: row.id,
    code: row.code,
    personId: row.person_id,
    mugshotImgKey: row.mugshot_img_key,
    mugshotSignedUrl: null,
    evaluation: row.evaluation,
    evaluationScore: row.evaluation_score != null ? Number(row.evaluation_score) : null,
    prisonIntakeId: row.prison_intake_id,
    firstName: row.first_name,
    lastName: row.last_name,
  }
}

async function withSignedUrl(detail: PrisonerDetail): Promise<PrisonerDetail> {
  if (!detail.mugshotImgKey) return detail
  try {
    detail.mugshotSignedUrl = await getMugshotSignedUrl(detail.mugshotImgKey)
  } catch {
    detail.mugshotSignedUrl = null
  }
  return detail
}

export const prisonerService = {
  async getAll(): Promise<PrisonerOption[]> {
    const rows = await prisonerRepository.findAll()
    return rows.map(toPrisonerOption)
  },

  async getById(id: number): Promise<PrisonerDetail | null> {
    const row = await prisonerRepository.findById(id)
    return row ? withSignedUrl(toDetail(row)) : null
  },

  async create(dto: CreatePrisonerDto): Promise<PrisonerDetail> {
    const row = await prisonerRepository.create(dto)
    return toDetail(row)
  },

  async update(id: number, dto: UpdatePrisonerDto): Promise<PrisonerDetail | null> {
    const row = await prisonerRepository.update(id, dto)
    return row ? withSignedUrl(toDetail(row)) : null
  },

  async delete(id: number): Promise<boolean> {
    return prisonerRepository.delete(id)
  },
}
