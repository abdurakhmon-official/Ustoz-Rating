import { z } from 'zod';

// schemas

export const LegalDocumentTypeSchema = z.enum(['TERMS', 'PRIVACY']);

export const CreateLegalDocumentInputSchema = z.object({
  text: z.string().min(1),
  effectiveFrom: z.coerce.date().optional(),
});

// types

export type LegalDocumentType = z.infer<typeof LegalDocumentTypeSchema>;
export type CreateLegalDocumentInput = z.infer<typeof CreateLegalDocumentInputSchema>;

// interfaces

export interface LegalDocumentOutput {
  type: LegalDocumentType;
  text: string;
  effectiveFrom: string;
}

export interface LegalDocumentVersion {
  id: string;
  text: string;
  effectiveFrom: string;
  createdAt: string;
}
