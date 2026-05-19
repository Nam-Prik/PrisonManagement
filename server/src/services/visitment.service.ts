import { visitmentRepository } from '../repositories/visitment.repository.js'
import type { CreateVisitmentDto, UpdateVisitmentDto } from '../dto/visitment.dto.js'

export const visitmentService = {
  async getAllVisitments() {
    return await visitmentRepository.findAll()
  },

  async getVisitmentDetail(id: number) {
    return await visitmentRepository.findById(id)
  },

  async createVisitment(dto: CreateVisitmentDto) {
    return await visitmentRepository.create(dto)
  },

  async updateVisitment(id: number, dto: UpdateVisitmentDto) {
    return await visitmentRepository.update(id, dto)
  },

  async deleteVisitment(id: number) {
    return await visitmentRepository.delete(id)
  },

  async lookupPrisoner(code: string) {
    return await visitmentRepository.findPrisonerByCode(code)
  },

  async lookupPerson(id: number) {
    return await visitmentRepository.findPersonById(id)
  },

  async getAllPrisoners() {
    return await visitmentRepository.listAllPrisoners()
  },

  async getAllPersons() {
    return await visitmentRepository.listAllPersons()
  }
}
