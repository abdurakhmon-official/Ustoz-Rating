import type { NotificationType } from '@repo/contracts';

export const DEFAULT_NOTIFICATION_TEMPLATES: Record<NotificationType, string> = {
  TEST_PUBLISHED: '{subject} fanidan yangi test joylandi: "{title}"',
  ATTEMPT_RESULT: '"{title}" testidan natijangiz: {score}% ({status})',
  RATING_CHANGED: "Tabriklaymiz! Respublika reytingida {delta} pog'onaga ko'tarildingiz.",
  CERTIFICATE_ISSUED: '{subject} fanidan sertifikat oldingiz — natija {score}%.',
};
