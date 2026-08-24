import { z } from 'zod';

// schemas

export const TestStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);

export const CreateTestInputSchema = z.object({
  title: z.string().min(1),
  subjectId: z.string().uuid(),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().int().positive().max(300),
  passingScore: z.coerce.number().int().min(1).max(100),
});

export const UpdateTestInputSchema = CreateTestInputSchema.partial().extend({
  status: TestStatusSchema.optional(),
});

export const AdminTestQuerySchema = z.object({
  subjectId: z.string().uuid().optional(),
  status: TestStatusSchema.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const QuestionOptionsSchema = z.array(z.string().min(1)).length(4);

export const CreateQuestionInputSchema = z.object({
  text: z.string().min(1),
  options: QuestionOptionsSchema,
  correctIndex: z.coerce.number().int().min(0).max(3),
  imageKey: z.string().nullable().optional(),
});

export const UpdateQuestionInputSchema = CreateQuestionInputSchema.partial();

// types

export type TestStatus = z.infer<typeof TestStatusSchema>;
export type CreateTestInput = z.infer<typeof CreateTestInputSchema>;
export type UpdateTestInput = z.infer<typeof UpdateTestInputSchema>;
export type AdminTestQuery = z.infer<typeof AdminTestQuerySchema>;
export type CreateQuestionInput = z.infer<typeof CreateQuestionInputSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionInputSchema>;

// interfaces

export interface AdminTestListItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  passingScore: number;
  status: TestStatus;
  questionCount: number;
  createdAt: string;
}

export interface QuestionOutput {
  id: string;
  testId: string;
  text: string;
  options: string[];
  correctIndex: number;
  imageKey: string | null;
  order: number;
}

export interface AdminTestDetail {
  id: string;
  title: string;
  subjectId: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  status: TestStatus;
  questions: QuestionOutput[];
}

export interface ImportQuestionsError {
  row: number;
  message: string;
}

export interface ImportQuestionsResult {
  imported: number;
  errors: ImportQuestionsError[];
}
