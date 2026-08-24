import { z } from 'zod';

// schemas

export const CreateSubjectInputSchema = z.object({
  name: z.string().min(1),
  imageKey: z.string().nullable().optional(),
});

export const UpdateSubjectInputSchema = CreateSubjectInputSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// types

export type CreateSubjectInput = z.infer<typeof CreateSubjectInputSchema>;
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectInputSchema>;

// interfaces

export interface SubjectOutput {
  id: string;
  name: string;
  imageKey: string | null;
  isActive?: boolean;
}
