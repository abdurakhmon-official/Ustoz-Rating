import { isRedisReady, redis } from '@/modules/redis';

export const EMAIL_VERIFICATION = {
  CODE_LENGTH: 6,
  TTL_SECONDS: 15 * 60,
} as const;

const KEY_PREFIX = 'email-verify:';

/** Redis mavjud bo'lmagan holatda ishlatiladigan zaxira xotira — TokenService'dagi xuddi shu patternga mos. */
const localCodes = new Map<string, { code: string; expiresAt: number }>();

const generateCode = (): string => {
  const max = 10 ** EMAIL_VERIFICATION.CODE_LENGTH;
  return Math.floor(Math.random() * max).toString().padStart(EMAIL_VERIFICATION.CODE_LENGTH, '0');
};

const rememberLocally = (userId: string, code: string): void => {
  localCodes.set(userId, { code, expiresAt: Date.now() + EMAIL_VERIFICATION.TTL_SECONDS * 1000 });
};

const checkLocally = (userId: string, code: string): boolean => {
  const entry = localCodes.get(userId);
  if (!entry) return false;

  if (entry.expiresAt <= Date.now()) {
    localCodes.delete(userId);
    return false;
  }

  if (entry.code !== code) return false;

  localCodes.delete(userId);
  return true;
};

export const issueEmailVerificationCode = async (userId: string): Promise<string> => {
  const code = generateCode();

  if (isRedisReady()) {
    try {
      await redis.set(KEY_PREFIX + userId, code, 'EX', EMAIL_VERIFICATION.TTL_SECONDS);
      return code;
    } catch {
      // Redis'ga yozib bo'lmadi — pastdagi lokal zaxiraga tushamiz.
    }
  }

  rememberLocally(userId, code);
  return code;
};

export const checkEmailVerificationCode = async (userId: string, code: string): Promise<boolean> => {
  if (isRedisReady()) {
    try {
      const stored = await redis.get(KEY_PREFIX + userId);
      if (stored) {
        if (stored !== code) return false;

        await redis.del(KEY_PREFIX + userId);
        return true;
      }
    } catch {
      // Redis'dan o'qib bo'lmadi — pastdagi lokal zaxirani tekshiramiz.
    }
  }

  return checkLocally(userId, code);
};
