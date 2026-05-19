import type { CreateIncidentDto, UpdateIncidentDto } from '../dto/incident.dto.js'
import type { IncidentDetail, IncidentListItem } from '../models/incident.model.js'
import { toIncidentListItem } from '../models/incident.model.js'
import { incidentRepository } from '../repositories/incident.repository.js'

export const incidentService = {
  async getAll(): Promise<IncidentListItem[]> {
    const rows = await incidentRepository.findAll()
    return rows.map(toIncidentListItem)
  },

  async getById(id: number): Promise<IncidentDetail | null> {
    return incidentRepository.findById(id)
  },

  async create(dto: CreateIncidentDto): Promise<IncidentDetail | null> {
    return incidentRepository.create(dto)
  },

  async update(id: number, dto: UpdateIncidentDto): Promise<IncidentDetail | null> {
    return incidentRepository.update(id, dto)
  },

  async delete(id: number): Promise<boolean> {
    return incidentRepository.delete(id)
  },
}
