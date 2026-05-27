export const GENDERS = ['M', 'F', 'Other', 'Undisclosed'] as const
export type Gender = (typeof GENDERS)[number]

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

export interface Person {
  id: number
  firstName: string
  lastName: string
  identificationNo: string | null
  gender: Gender
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: BloodType
  nationalIdNumber: number | null
  nationalIdFileKey: string | null
  houseRegistrationNumber: number | null
  houseRegistrationFileKey: string | null
  birthCertificateNumber: number | null
  birthCertificateFileKey: string | null
}

export interface CreatePersonDto {
  firstName: string
  lastName: string
  identificationNo?: string
  gender: Gender
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: BloodType
  nationalIdNumber?: number
  nationalIdFileKey?: string
  houseRegistrationNumber?: number
  houseRegistrationFileKey?: string
  birthCertificateNumber?: number
  birthCertificateFileKey?: string
}

export type UpdatePersonDto = Partial<CreatePersonDto>
