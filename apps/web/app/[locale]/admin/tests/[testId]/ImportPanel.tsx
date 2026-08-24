'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { messageFor } from '@/lib/messages';
import { useImportQuestions } from '@/hooks/use-tests';

export function ImportPanel({ testId }: { testId: string }) {
  const t = useTranslations('admin.tests.import');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importQuestions = useImportQuestions();

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    await importQuestions.mutateAsync({ testId, file });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t('hint')}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={onFileSelected}
        />
        <Button type="button" variant="outline" size="sm" className="self-start" disabled={importQuestions.isPending} onClick={() => fileInputRef.current?.click()}>
          {importQuestions.isPending ? t('uploading') : t('button')}
        </Button>

        {importQuestions.data && (
          <div className="flex flex-col gap-1 rounded-md border border-border p-3 text-sm">
            <p className="font-medium">{t('imported', { count: importQuestions.data.imported })}</p>
            {importQuestions.data.errors.length > 0 && (
              <>
                <p className="mt-1 font-medium text-destructive">{t('errorsTitle')}</p>
                <ul className="list-disc pl-5">
                  {importQuestions.data.errors.map((error) => (
                    <li key={error.row} className="text-destructive">
                      {t('rowError', { row: error.row, message: messageFor(error.message, error.message) ?? error.message })}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
