import { z } from 'zod';

// schemas

export const UpdateCertificateTemplateInputSchema = z.object({
  text: z.string().min(1),
});

// types

export type UpdateCertificateTemplateInput = z.infer<typeof UpdateCertificateTemplateInputSchema>;

// interfaces

export interface CertificateListItem {
  certificateId: string;
  subjectName: string;
  score: number;
  issuedAt: string;
}

export interface CertificateOutput {
  certificateId: string;
  teacherName: string;
  subjectName: string;
  score: number;
  issuedAt: string;
  renderedText: string;
}

export interface CertificateTemplateOutput {
  text: string;
}
