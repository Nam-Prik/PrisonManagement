import http from './http'
import type { ApiResponse } from '../types/response'

export interface VisitmentVisitor {
  personId: number
  relation: string
  firstName?: string
  lastName?: string
  gender?: string
  identificationNo?: string
}

export interface VisitmentData {
  id?: number
  prisonerId: number
  prisonerCode?: string
  prisonerName?: string
  visitmentDate: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  description?: string
  visitorCount?: number
  visitors: VisitmentVisitor[]
}

export const visitmentApi = {
  getAll: async () => {
    const { data } = await http.get<ApiResponse<VisitmentData[]>>('/visitment')
    return data.data
  },

  getById: async (id: number) => {
    const { data } = await http.get<ApiResponse<VisitmentData>>(`/visitment/${id}`)
    return data.data
  },

  create: async (payload: VisitmentData) => {
    const { data } = await http.post<ApiResponse<VisitmentData>>('/visitment', payload)
    return data.data
  },

  update: async (id: number, payload: VisitmentData) => {
    const { data } = await http.put<ApiResponse<VisitmentData>>(`/visitment/${id}`, payload)
    return data.data
  },

  delete: async (id: number) => {
    await http.delete(`/visitment/${id}`)
  },

  lookupPrisoner: async (code: string) => {
    const { data } = await http.get<ApiResponse<{ id: number; code: string; firstName: string; lastName: string }>>('/visitment/prisoner-lookup', {
      params: { code }
    })
    return data.data
  },

  lookupPerson: async (id: number) => {
    const { data } = await http.get<ApiResponse<{ id: number; firstName: string; lastName: string; gender: string; identificationNo: string }>>('/visitment/person-lookup', {
      params: { id: String(id) }
    })
    return data.data
  },

  getAllPrisoners: async () => {
    const { data } = await http.get<ApiResponse<{ id: number; code: string; firstName: string; lastName: string }[]>>('/visitment/prisoners')
    return data.data
  },

  getAllPersons: async () => {
    const { data } = await http.get<ApiResponse<{ id: number; firstName: string; lastName: string; gender: string; identificationNo: string }[]>>('/visitment/persons')
    return data.data
  }
}
