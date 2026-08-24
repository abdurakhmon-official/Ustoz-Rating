import type { Locale } from '@repo/contracts';
import { uz } from './uz.messages';
import type { MessageCode } from './message-codes';

const CATALOGS: Record<Locale, Record<MessageCode, string>> = { uz };

export const translate = (code: string, locale: Locale): string | null => {
  const catalog = CATALOGS[locale];
  return code in catalog ? catalog[code as MessageCode] : null;
};

export type { MessageCode };
