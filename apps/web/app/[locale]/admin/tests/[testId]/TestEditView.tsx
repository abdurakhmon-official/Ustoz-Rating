'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAdminTest } from '@/hooks/use-tests';
import { TestInfoCard } from './TestInfoCard';
import { QuestionsSection } from './QuestionsSection';
import { ImportPanel } from './ImportPanel';

export function TestEditView({ testId }: { testId: string }) {
  const t = useTranslations('admin.tests');
  const { data: test } = useAdminTest(testId);

  if (!test) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link href="/admin/tests" className="text-sm text-muted-foreground hover:underline">
        ← {t('backToList')}
      </Link>

      <TestInfoCard test={test} />
      <ImportPanel testId={testId} />
      <QuestionsSection testId={testId} questions={test.questions} />
    </div>
  );
}
