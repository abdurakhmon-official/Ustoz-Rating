'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Link } from '@/i18n/navigation';
import { usePublishedTests } from '@/hooks/use-attempts';
import { useSubjects } from '@/hooks/use-subjects';

const ICON_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
];

// ICON_COLORS bo'sh bo'lmagan literal massiv — birinchi element doim mavjud.
const DEFAULT_ICON_COLOR = ICON_COLORS[0] as string;

const colorForSubject = (subjectId: string): string => {
  const hash = subjectId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ICON_COLORS[hash % ICON_COLORS.length] ?? DEFAULT_ICON_COLOR;
};

export function TestListView() {
  const t = useTranslations('tests');
  const { data: subjects } = useSubjects();
  const [subjectId, setSubjectId] = useState('');
  const { data: tests } = usePublishedTests(subjectId || undefined);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="max-w-52">
          <option value="">{t('allSubjects')}</option>
          {subjects?.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>

      {!tests?.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardContent className="flex flex-col gap-3 py-5">
                <div className={`flex size-11 items-center justify-center rounded-xl ${colorForSubject(test.subjectId)}`}>
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{test.title}</p>
                  <p className="text-sm text-muted-foreground">{test.subjectName}</p>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>{t('questionCount', { count: test.questionCount })}</span>
                  <span>{t('duration', { minutes: test.durationMinutes })}</span>
                  <span>{t('passingScore', { score: test.passingScore })}</span>
                </div>
                <Link href={{ pathname: '/tests/[testId]', params: { testId: test.id } }}>
                  <Button size="sm" className="w-full">
                    {t('start')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
