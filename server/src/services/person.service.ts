import type { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto.js'
import type { Person } from '../models/person.model.js'
import { toPerson } from '../models/person.model.js'
import { personRepository } from '../repositories/person.repository.js'

export const personService = {
  async getAll(): Promise<Person[]> {
    const rows = await personRepository.findAll()
    return rows.map(toPerson)
  },

  async getById(id: number): Promise<Person | null> {
    const row = await personRepository.findById(id)
    return row ? toPerson(row) : null
  },

  async create(dto: CreatePersonDto): Promise<Person> {
    const row = await personRepository.create(dto)
    return toPerson(row)
  },

  async update(id: number, dto: UpdatePersonDto): Promise<Person | null> {
    const row = await personRepository.update(id, dto)
    return row ? toPerson(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return personRepository.delete(id)
  },
}
