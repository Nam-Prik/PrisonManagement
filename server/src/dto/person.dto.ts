import { z } from 'zod'

const genderValues = ['M', 'F', 'Other', 'Undisclosed'] as const
const bloodTypeValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const

export const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  identificationNo: z.string().optional(),
  gender: z.enum(genderValues),
  address: z.string().min(1, 'Address is required'),
  contactNo: z.string().min(1, 'Contact number is required'),
  age: z.number().int().positive(),
  dateOfBirth: z.string().date('Expected YYYY-MM-DD'),
  bloodType: z.enum(bloodTypeValues),
  nationalIdNumber: z.number().int().positive().optional(),
  nationalIdFileKey: z.string().optional(),
  houseRegistrationNumber: z.number().int().positive().optional(),
  houseRegistrationFileKey: z.string().optional(),
  birthCertificateNumber: z.number().int().positive().optional(),
  birthCertificateFileKey: z.string().optional(),
})

export type CreatePersonDto = z.infer<typeof CreatePersonSchema>

export const UpdatePersonSchema = CreatePersonSchema.partial()

export type UpdatePersonDto = z.infer<typeof UpdatePersonSchema>
