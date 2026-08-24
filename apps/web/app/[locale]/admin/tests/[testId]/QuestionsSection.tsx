'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { QuestionOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { assetUrl, cn } from '@/lib/utils';
import { useDeleteQuestion } from '@/hooks/use-questions';
import { QuestionForm } from './QuestionForm';

export function QuestionsSection({ testId, questions }: { testId: string; questions: QuestionOutput[] }) {
  const t = useTranslations('admin.tests.questions');
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button size="sm" variant="outline" onClick={() => setAdding((value) => !value)}>
          {t('add')}
        </Button>
      </div>

      {adding && <QuestionForm testId={testId} onDone={() => setAdding(false)} />}

      {!questions.length && !adding ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((question, index) => (
            <QuestionRow key={question.id} testId={testId} question={question} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionRow({ testId, question, index }: { testId: string; question: QuestionOutput; index: number }) {
  const t = useTranslations('admin.tests.questions');
  const [editing, setEditing] = useState(false);
  const deleteQuestion = useDeleteQuestion(testId);

  if (editing) {
    return <QuestionForm testId={testId} question={question} onDone={() => setEditing(false)} />;
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium">
            {index + 1}. {question.text}
          </p>
          {question.imageKey && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={assetUrl(question.imageKey)} alt="" className="h-14 shrink-0 rounded object-cover" />
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className={cn(
                'rounded-md border border-border px-3 py-1.5 text-sm',
                optionIndex === question.correctIndex && 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400',
              )}
            >
              {String.fromCharCode(65 + optionIndex)}) {option}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            {t('edit')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => deleteQuestion.mutate(question.id)}>
            {t('delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
