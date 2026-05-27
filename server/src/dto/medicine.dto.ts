import { z } from 'zod'

export const CreateMedicineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genericName: z.string().optional(),
  code: z.number().int().positive('Code must be a positive integer'),
  caution: z.string().min(1, 'Caution is required'),
})

export type CreateMedicineDto = z.infer<typeof CreateMedicineSchema>

export const UpdateMedicineSchema = CreateMedicineSchema.partial()

export type UpdateMedicineDto = z.infer<typeof UpdateMedicineSchema>
