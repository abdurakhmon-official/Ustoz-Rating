import { z } from 'zod';

export const LOCALES = ['uz'] as const;
export const DEFAULT_LOCALE: Locale = 'uz';

// schemas

export const LocaleSchema = z.enum(LOCALES);

// types

export type Locale = (typeof LOCALES)[number];
