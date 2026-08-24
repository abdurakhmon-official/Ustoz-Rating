'use client';

import { ClipboardList } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link } from '@/i18n/navigation';
import { useMyAttempts } from '@/hooks/use-attempts';

export function AttemptListView() {
  const t = useTranslations('attempts');
  const { data: attempts } = useMyAttempts();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {!attempts?.length ? (
        <EmptyState icon={ClipboardList} title={t('empty')} />
      ) : (
        <div className="flex flex-col gap-2">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{attempt.testTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {attempt.subjectName} · {new Date(attempt.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{attempt.score}%</span>
                <Badge variant={attempt.passed ? 'success' : 'danger'}>{attempt.passed ? t('status.passed') : t('status.failed')}</Badge>
                <Link href={{ pathname: '/attempts/[attemptId]', params: { attemptId: attempt.id } }}>
                  <Button size="sm" variant="outline">
                    {t('viewDetail')}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
