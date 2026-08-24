'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { LegalDocumentType } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useLegalDocument, useLegalHistory, usePublishLegalDocument } from '@/hooks/use-legal';

function LegalDocumentEditor({ type }: { type: LegalDocumentType }) {
  const t = useTranslations('admin.legal');
  const { data: current } = useLegalDocument(type);
  const { data: history } = useLegalHistory(type);
  const publish = usePublishLegalDocument();
  const [text, setText] = useState('');

  useEffect(() => {
    if (current) setText(current.text);
  }, [current]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    publish.mutate({ type, input: { text } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(`type.${type}`)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea rows={8} value={text} onChange={(event) => setText(event.target.value)} />
          <Button type="submit" size="sm" disabled={publish.isPending || !text.trim()} className="self-start">
            {t('publish')}
          </Button>
        </form>

        {!!history?.length && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{t('history')}</p>
            {history.map((version) => (
              <div key={version.id} className="text-sm text-muted-foreground">
                {new Date(version.effectiveFrom).toLocaleDateString()} —{' '}
                <span className="truncate">{version.text.slice(0, 60)}{version.text.length > 60 ? '…' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminLegalView() {
  const t = useTranslations('admin.legal');

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <LegalDocumentEditor type="TERMS" />
      <LegalDocumentEditor type="PRIVACY" />
    </div>
  );
}
