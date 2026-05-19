import type {
  ConfiscatedItemReport,
  IntakeByDateRange,
  TotalItemsPerIntake,
} from '../types/dto/prisonerintake.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getIntakesByDateRange = async (
  fromDate: string,
  toDate: string,
  prisonerCode?: string
): Promise<IntakeByDateRange[]> => {
  const params: Record<string, string> = { fromDate, toDate }
  if (prisonerCode) params.prisonerCode = prisonerCode
  const { data } = await http.get<ApiResponse<IntakeByDateRange[]>>(
    '/prisoner-intake-reports/by-date-range',
    { params }
  )
  return data.data
}

export const getConfiscatedItems = async (
  fromDate: string,
  toDate: string,
  itemFilter?: string
): Promise<ConfiscatedItemReport[]> => {
  const params: Record<string, string> = { fromDate, toDate }
  if (itemFilter) params.itemFilter = itemFilter
  const { data } = await http.get<ApiResponse<ConfiscatedItemReport[]>>(
    '/prisoner-intake-reports/confiscated-items',
    { params }
  )
  return data.data
}

export const getTotalItemsPerIntake = async (
  fromDate: string,
  toDate: string,
  topN: number
): Promise<TotalItemsPerIntake[]> => {
  const { data } = await http.get<ApiResponse<TotalItemsPerIntake[]>>(
    '/prisoner-intake-reports/total-items',
    { params: { fromDate, toDate, topN: String(topN) } }
  )
  return data.data
}
