import { z } from 'zod'

export const CreatePrisonerIntakeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  identificationNo: z.string().min(1, 'Identification number is required'),
  gender: z.enum(['M', 'F', 'Other', 'Undisclosed']),
  address: z.string().min(1, 'Address is required'),
  contactNo: z.string().min(1, 'Contact number is required'),
  age: z.number().int().positive('Age must be a positive integer'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']),
  evaluation: z.string().max(255).optional(),
  intakeDate: z.string().min(1, 'Intake date is required'),
  initialHealthStatus: z.enum([
    'Cleared',
    'Routine Follow-up',
    'Observation',
    'Quarantined',
    'Hospitalized',
    'Critical',
    'Deceased',
  ]),
  mugshotImgKey: z.string().optional(),
  confiscatedItems: z
    .array(
      z.object({
        itemName: z.string().min(1),
        quantity: z.number().int().positive(),
        remarks: z.string().max(255).optional(),
      })
    )
    .default([]),
})

export type CreatePrisonerIntakeDto = z.infer<typeof CreatePrisonerIntakeSchema>

const ConfiscatedItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int().positive(),
  remarks: z.string().max(255).optional(),
})

export const UpdatePrisonerIntakeSchema = z.object({
  intakeDate: z.string().min(1).optional(),
  initialHealthStatus: z
    .enum([
      'Cleared',
      'Routine Follow-up',
      'Observation',
      'Quarantined',
      'Hospitalized',
      'Critical',
      'Deceased',
    ])
    .optional(),
  mugshotImgKey: z.string().optional(),
  confiscatedItems: z.array(ConfiscatedItemSchema).optional(),
})

export type UpdatePrisonerIntakeDto = z.infer<typeof UpdatePrisonerIntakeSchema>
