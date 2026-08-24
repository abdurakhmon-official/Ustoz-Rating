import { z } from 'zod';

// schemas

export const StartAttemptInputSchema = z.object({
  testId: z.string().uuid(),
});

export const SubmitAttemptInputSchema = z.object({
  answers: z.record(z.string().uuid(), z.number().int().min(0).max(3)),
});

// types

export type StartAttemptInput = z.infer<typeof StartAttemptInputSchema>;
export type SubmitAttemptInput = z.infer<typeof SubmitAttemptInputSchema>;

// interfaces

export interface PublishedTestListItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  questionCount: number;
}

export interface StudentQuestionOutput {
  id: string;
  text: string;
  options: string[];
  imageKey: string | null;
  order: number;
}

export interface AttemptInProgress {
  status: 'IN_PROGRESS';
  id: string;
  testId: string;
  testTitle: string;
  durationMinutes: number;
  startedAt: string;
  questions: StudentQuestionOutput[];
}

export interface AttemptResult {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  correctCount: number;
  questionCount: number;
  passed: boolean;
  passingScore: number;
  timeSpentSeconds: number;
  submittedAt: string;
}

export interface AttemptListItem {
  id: string;
  testId: string;
  testTitle: string;
  subjectName: string;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface AttemptDetailQuestion {
  text: string;
  options: string[];
  selectedIndex: number | null;
  isCorrect: boolean;
}

export interface AttemptDetail extends AttemptResult {
  status: 'SUBMITTED';
  questions: AttemptDetailQuestion[];
}

export type AttemptState = AttemptInProgress | AttemptDetail;
