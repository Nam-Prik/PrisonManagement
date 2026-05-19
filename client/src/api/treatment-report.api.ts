import type {
  MedicinePrescriptionExperience,
  NurseWorkloadPercentage,
  TreatmentExperience,
} from '../types/dto/treatment-report.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getTreatmentExperience = async (
  startDate: string,
  endDate: string
): Promise<TreatmentExperience[]> => {
  const { data } = await http.get<ApiResponse<TreatmentExperience[]>>(
    '/treatment-reports/treatment-experience',
    {
      params: {
        startDate,
        endDate,
      },
    }
  )
  return data.data
}

export const getMedicinePrescriptionExperience = async (
  caution: string
): Promise<MedicinePrescriptionExperience[]> => {
  const { data } = await http.get<ApiResponse<MedicinePrescriptionExperience[]>>(
    '/treatment-reports/medicine-prescription',
    {
      params: {
        caution,
      },
    }
  )
  return data.data
}

export const getNurseWorkloadPercentage = async (): Promise<NurseWorkloadPercentage[]> => {
  const { data } = await http.get<ApiResponse<NurseWorkloadPercentage[]>>(
    '/treatment-reports/nurse-workload'
  )
  return data.data
}
