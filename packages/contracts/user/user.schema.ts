import { z } from 'zod';
import { GenderSchema } from '../auth/auth.schema';

// schemas

export const UserRoleSchema = z.enum(['ADMIN', 'TEACHER']);

export const UpdateProfileInputSchema = z.object({
  phone: z.string().min(7).max(20).optional(),
  gender: GenderSchema.optional(),
  avatar: z.string().nullable().optional(),
  regionId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  position: z.string().min(1).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
});

export const AdminUserQuerySchema = z.object({
  role: UserRoleSchema.optional(),
  search: z.string().optional(),
  regionId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const UpdateRoleInputSchema = z.object({
  role: UserRoleSchema,
});

export const SetActiveInputSchema = z.object({
  active: z.boolean(),
});

export const AdminCreateUserInputSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: UserRoleSchema.default('TEACHER'),
  phone: z.string().min(7).max(20).optional(),
  gender: GenderSchema.optional(),
  regionId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  position: z.string().min(1).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
});

export const AdminUpdateUserInputSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional(),
  gender: GenderSchema.optional(),
  regionId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  position: z.string().min(1).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
});

// types

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;
export type SetActiveInput = z.infer<typeof SetActiveInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type AdminCreateUserInput = z.infer<typeof AdminCreateUserInputSchema>;
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserInputSchema>;

// interfaces

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  subjectName: string | null;
  schoolName: string | null;
  regionName: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  avatar: string | null;
  regionId: string | null;
  regionName: string | null;
  districtId: string | null;
  districtName: string | null;
  schoolId: string | null;
  schoolName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  position: string | null;
  experienceYears: number | null;
  createdAt: string;
}
