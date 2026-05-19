import type { CreatePrisonerIntakeDto, UpdatePrisonerIntakeDto } from '../dto/prisonerintake.dto.js'
import type { PrisonerIntakeDetail } from '../models/prisonerintake.model.js'
import { prisonerIntakeRepository } from '../repositories/prisonerintake.repository.js'
import { getMugshotSignedUrl } from './signurl.js'

async function withSignedUrl(
  detail: PrisonerIntakeDetail | null
): Promise<PrisonerIntakeDetail | null> {
  if (!detail) return null
  if (!detail.mugshotImgKey) return detail
  try {
    detail.mugshotSignedUrl = await getMugshotSignedUrl(detail.mugshotImgKey)
  } catch {
    detail.mugshotSignedUrl = null
  }
  return detail
}

export const prisonerIntakeService = {
  async getAll() {
    return prisonerIntakeRepository.findAll()
  },

  async getById(id: number) {
    return withSignedUrl(await prisonerIntakeRepository.findById(id))
  },

  async create(dto: CreatePrisonerIntakeDto) {
    return withSignedUrl(await prisonerIntakeRepository.create(dto))
  },

  async update(id: number, dto: UpdatePrisonerIntakeDto) {
    return withSignedUrl(await prisonerIntakeRepository.update(id, dto))
  },

  async delete(id: number) {
    return prisonerIntakeRepository.delete(id)
  },
}
