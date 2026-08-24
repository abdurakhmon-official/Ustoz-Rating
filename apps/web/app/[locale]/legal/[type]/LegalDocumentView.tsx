'use client';

import { useTranslations } from 'next-intl';
import type { LegalDocumentType } from '@repo/contracts';
import { Card, CardContent } from '@/components/ui/Card';
import { useLegalDocument } from '@/hooks/use-legal';

export function LegalDocumentView({ type }: { type: LegalDocumentType }) {
  const t = useTranslations('legal');
  const { data } = useLegalDocument(type);

  if (!data) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">{t(`title.${type}`)}</h1>
        <p className="text-sm text-muted-foreground">{t('effectiveFrom', { date: new Date(data.effectiveFrom).toLocaleDateString() })}</p>
      </div>

      <Card>
        <CardContent className="py-6">
          <p className="whitespace-pre-line text-sm leading-relaxed">{data.text}</p>
        </CardContent>
      </Card>
    </div>
  );
}
