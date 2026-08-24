import { z } from 'zod';
import { DEFAULT_LOCALE, LocaleSchema } from '../common/locale';

// schemas

export const PasswordSchema = z.string().min(8, 'VALIDATION_PASSWORD_SHORT').max(128, 'VALIDATION_PASSWORD_LONG');

export const GenderSchema = z.enum(['MALE', 'FEMALE']);

const assertNotDerived = (password: string, ...parts: (string | null | undefined)[]): boolean => {
  const value = password.toLowerCase();

  return !parts.some((part) => {
    const candidate = (part ?? '').toLowerCase().split('@')[0] ?? '';
    return candidate.length >= 4 && value.includes(candidate);
  });
};

/** Bo'sh string kelsa (masalan reset qilingan `<select>` yoki tozalangan forma maydoni) `undefined` sifatida ko'radi — aks holda `.optional()` uni "berilmagan" deb hisoblamaydi. */
const emptyToUndefined = (schema: z.ZodTypeAny) => z.preprocess((value) => (value === '' ? undefined : value), schema);

export const SignupInputSchema = z
  .object({
    fullName: z.string().min(1),
    email: z.string().email(),
    password: PasswordSchema,
    phone: z.string().min(7).max(20),
    gender: GenderSchema,
    regionId: z.string().uuid(),
    districtId: z.string().uuid(),
    schoolId: emptyToUndefined(z.string().uuid().optional()),
    schoolName: emptyToUndefined(z.string().trim().min(1).max(200).optional()),
    subjectId: z.string().uuid(),
    position: z.string().min(1),
    experienceYears: z.coerce.number().int().min(0).max(60),
    locale: LocaleSchema.default(DEFAULT_LOCALE),
  })
  .refine((input) => Boolean(input.schoolId) !== Boolean(input.schoolName), {
    message: 'GEO_SCHOOL_REQUIRED',
    path: ['schoolId'],
  })
  .refine((input) => assertNotDerived(input.password, input.email, input.fullName), {
    message: 'VALIDATION_PASSWORD_PERSONAL',
    path: ['password'],
  });

export const SigninInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const VerifyEmailInputSchema = z.object({
  code: z.string().length(6),
});

// types

export type SignupInput = z.infer<typeof SignupInputSchema>;
export type SigninInput = z.infer<typeof SigninInputSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailInputSchema>;
export type Gender = z.infer<typeof GenderSchema>;

// interfaces

export interface UserOutput {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  phone: string | null;
  gender: Gender | null;
  avatar: string | null;
  locale: string;
  emailVerified: boolean;
  active: boolean;
  isAdmin: boolean;
  regionId: string | null;
  districtId: string | null;
  schoolId: string | null;
  subjectId: string | null;
  position: string | null;
  experienceYears: number | null;
}

export interface AccessTokenOutput {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}
