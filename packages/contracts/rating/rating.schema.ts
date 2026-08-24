import { z } from 'zod';
import { GenderSchema } from '../auth/auth.schema';

// schemas

export const RatingPeriodSchema = z.enum(['all', 'week', 'month']);

export const RatingQuerySchema = z.object({
  regionId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  gender: GenderSchema.optional(),
  experienceMin: z.coerce.number().int().min(0).optional(),
  period: RatingPeriodSchema.default('all'),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const UpdateRatingSettingsInputSchema = z.object({
  avgScoreWeight: z.coerce.number().min(0).max(1),
  bestScoreWeight: z.coerce.number().min(0).max(1),
  consistencyWeight: z.coerce.number().min(0).max(1),
  attemptCountWeight: z.coerce.number().min(0).max(1),
  minAttemptsRequired: z.coerce.number().int().min(1).max(100),
});

// types

export type RatingPeriod = z.infer<typeof RatingPeriodSchema>;
export type RatingQuery = z.infer<typeof RatingQuerySchema>;
export type UpdateRatingSettingsInput = z.infer<typeof UpdateRatingSettingsInputSchema>;

// interfaces

export interface RatingSettingsOutput {
  avgScoreWeight: number;
  bestScoreWeight: number;
  consistencyWeight: number;
  attemptCountWeight: number;
  minAttemptsRequired: number;
}

export interface RatingListItem {
  rank: number;
  teacherId: string;
  fullName: string;
  avatar: string | null;
  schoolName: string | null;
  regionName: string | null;
  subjectName: string | null;
  avgScore: number;
  bestScore: number;
  attemptCount: number;
  compositeScore: number;
}

export interface MyRatingOutput {
  eligible: boolean;
  avgScore: number;
  bestScore: number;
  attemptCount: number;
  republicRank: number | null;
  republicTotal: number;
  regionRank: number | null;
  regionTotal: number;
  districtRank: number | null;
  districtTotal: number;
}
