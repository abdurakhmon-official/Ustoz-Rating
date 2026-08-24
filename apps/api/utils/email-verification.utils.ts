import { isRedisReady, redis } from '@/modules/redis';

export const EMAIL_VERIFICATION = {
  CODE_LENGTH: 6,
  TTL_SECONDS: 15 * 60,
} as const;

const KEY_PREFIX = 'email-verify:';

const generateCode = (): string => {
  const max = 10 ** EMAIL_VERIFICATION.CODE_LENGTH;
  return Math.floor(Math.random() * max).toString().padStart(EMAIL_VERIFICATION.CODE_LENGTH, '0');
};

export const issueEmailVerificationCode = async (userId: string): Promise<string> => {
  const code = generateCode();
  if (isRedisReady()) {
    await redis.set(KEY_PREFIX + userId, code, 'EX', EMAIL_VERIFICATION.TTL_SECONDS);
  }
  return code;
};

export const checkEmailVerificationCode = async (userId: string, code: string): Promise<boolean> => {
  if (!isRedisReady()) return false;

  const stored = await redis.get(KEY_PREFIX + userId);
  if (!stored || stored !== code) return false;

  await redis.del(KEY_PREFIX + userId);
  return true;
};
