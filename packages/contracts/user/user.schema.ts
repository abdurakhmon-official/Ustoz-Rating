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
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(50).default(20),
});

export const UpdateRoleInputSchema = z.object({
  role: UserRoleSchema,
});

export const SetActiveInputSchema = z.object({
  active: z.boolean(),
});

// types

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;
export type SetActiveInput = z.infer<typeof SetActiveInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

// interfaces

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
}
