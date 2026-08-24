'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/hooks/use-auth';

export function EmailVerificationBanner() {
  const t = useTranslations('auth.verifyEmail');
  const { user, isAuthenticated } = useSession();

  if (!isAuthenticated || user?.emailVerified) return null;

  return (
    <div className="border-b border-border bg-accent px-4 py-2 text-center text-sm text-accent-foreground">
      {t('subtitle')}{' '}
      <Link href="/verify-email" className="font-semibold underline underline-offset-2">
        {t('title')}
      </Link>
    </div>
  );
}
