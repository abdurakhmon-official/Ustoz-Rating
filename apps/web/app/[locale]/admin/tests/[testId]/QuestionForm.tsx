'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { QuestionOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { assetUrl, cn } from '@/lib/utils';
import { useUploadDirect } from '@/hooks/use-upload';
import { useCreateQuestion } from '@/hooks/use-tests';
import { useUpdateQuestion } from '@/hooks/use-questions';

const OPTION_KEYS = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

export function QuestionForm({ testId, question, onDone }: { testId: string; question?: QuestionOutput; onDone: () => void }) {
  const t = useTranslations('admin.tests.questions');
  const [text, setText] = useState(question?.text ?? '');
  const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0);
  const [imageKey, setImageKey] = useState<string | null | undefined>(question?.imageKey);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDirect();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion(testId);

  const isPending = upload.isPending || createQuestion.isPending || updateQuestion.isPending;

  const onImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const uploaded = await upload.mutateAsync({ folder: 'subject', file });
    setImageKey(uploaded.key);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || options.some((option) => !option.trim())) return;

    const input = { text, options, correctIndex, imageKey };

    if (question) {
      await updateQuestion.mutateAsync({ questionId: question.id, input });
    } else {
      await createQuestion.mutateAsync({ testId, input });
    }

    onDone();
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <FormField label={t('text')} htmlFor="question-text">
            <Textarea id="question-text" value={text} onChange={(event) => setText(event.target.value)} />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OPTION_KEYS.map((key, index) => (
              <FormField key={key} label={t(key)} htmlFor={`option-${index}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={correctIndex === index}
                    onChange={() => setCorrectIndex(index)}
                    className="size-4 accent-primary"
                    aria-label={t('correctAnswer')}
                  />
                  <Input
                    id={`option-${index}`}
                    value={options[index]}
                    onChange={(event) => setOptions((prev) => prev.map((value, i) => (i === index ? event.target.value : value)))}
                    className={cn(correctIndex === index && 'border-primary')}
                  />
                </div>
              </FormField>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              {t('image')}
            </Button>
            {imageKey && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(imageKey)} alt="" className="h-12 rounded object-cover" />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {t('save')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
