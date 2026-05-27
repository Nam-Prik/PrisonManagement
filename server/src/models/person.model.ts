export type Gender = 'M' | 'F' | 'Other' | 'Undisclosed'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'

export interface PersonRow {
  id: number
  first_name: string
  last_name: string
  identification_no: string | null
  gender: Gender
  address: string
  contact_no: string
  age: number
  date_of_birth: string
  blood_type: BloodType
  national_id_number: number | null
  national_id_file_key: string | null
  house_registration_number: number | null
  house_registration_file_key: string | null
  birth_certificate_number: number | null
  birth_certificate_file_key: string | null
}

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

export const toPerson = (row: PersonRow): Person => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  identificationNo: row.identification_no,
  gender: row.gender,
  address: row.address,
  contactNo: row.contact_no,
  age: row.age,
  dateOfBirth:
    typeof row.date_of_birth === 'string'
      ? row.date_of_birth.slice(0, 10)
      : new Date(row.date_of_birth).toISOString().slice(0, 10),
  bloodType: row.blood_type,
  nationalIdNumber: row.national_id_number,
  nationalIdFileKey: row.national_id_file_key,
  houseRegistrationNumber: row.house_registration_number,
  houseRegistrationFileKey: row.house_registration_file_key,
  birthCertificateNumber: row.birth_certificate_number,
  birthCertificateFileKey: row.birth_certificate_file_key,
})
