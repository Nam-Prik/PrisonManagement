import type { PrisonerOption } from '../models/prisoner.model.js'
import { toPrisonerOption } from '../models/prisoner.model.js'
import { prisonerRepository } from '../repositories/prisoner.repository.js'

export const prisonerService = {
  async getAll(): Promise<PrisonerOption[]> {
    const rows = await prisonerRepository.findAll()
    return rows.map(toPrisonerOption)
  },
}
