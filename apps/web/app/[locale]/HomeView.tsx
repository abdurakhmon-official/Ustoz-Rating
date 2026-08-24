'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/hooks/use-auth';
import { TeacherDashboardView } from './TeacherDashboardView';

export function HomeView() {
  const t = useTranslations('home');
  const router = useRouter();
  const { user, isAuthenticated, loading } = useSession();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') router.push('/admin');
  }, [isAuthenticated, user, router]);

  if (loading || (isAuthenticated && user?.role === 'ADMIN')) return null;

  if (isAuthenticated && user?.role === 'TEACHER') {
    return <TeacherDashboardView />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('title')}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t('subtitle')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/sign-up">
          <Button size="lg">{t('getStarted')}</Button>
        </Link>
        <Link href="/sign-in">
          <Button size="lg" variant="outline">
            {t('signIn')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
