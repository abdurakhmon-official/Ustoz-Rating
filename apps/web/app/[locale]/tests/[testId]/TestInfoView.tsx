'use client';

import { BookOpen, CircleCheck, Clock, ListChecks } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { errorFrom } from '@/lib/errors';
import { useRouter } from '@/i18n/navigation';
import { usePublishedTests, useStartAttempt } from '@/hooks/use-attempts';

export function TestInfoView({ testId }: { testId: string }) {
  const t = useTranslations('tests');
  const router = useRouter();
  const { data: tests } = usePublishedTests();
  const startAttempt = useStartAttempt();

  const test = tests?.find((item) => item.id === testId);

  const onStart = async () => {
    try {
      const attempt = await startAttempt.mutateAsync(testId);
      router.push({ pathname: '/attempts/[attemptId]', params: { attemptId: attempt.id } });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(errorFrom(error).message);
    }
  };

  if (!test) return null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-8" />
          </div>
          <div>
            <p className="text-xl font-bold">{test.title}</p>
            <p className="text-muted-foreground">{test.subjectName}</p>
          </div>
          {test.description && <p className="text-sm text-muted-foreground">{test.description}</p>}

          <div className="grid w-full grid-cols-3 gap-3">
            <InfoStat icon={<ListChecks className="size-5" />} label={t('info.questions')} value={String(test.questionCount)} />
            <InfoStat icon={<Clock className="size-5" />} label={t('info.duration')} value={t('duration', { minutes: test.durationMinutes })} />
            <InfoStat icon={<CircleCheck className="size-5" />} label={t('info.passingScore')} value={`${test.passingScore}%`} />
          </div>

          <Button size="lg" className="w-full" disabled={startAttempt.isPending} onClick={onStart}>
            {t('start')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border p-3">
      <div className="text-primary">{icon}</div>
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
