'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { PlaceholderPicker } from '@/components/ui/PlaceholderPicker';
import { TemplatePreview } from '@/components/ui/TemplatePreview';
import { Textarea } from '@/components/ui/Textarea';
import { useCertificateTemplate, useUpdateCertificateTemplate } from '@/hooks/use-certificates';

const PLACEHOLDER_TOKENS = ['fullName', 'subject', 'score'] as const;

const PREVIEW_VALUES = { fullName: 'Aliyev Anvar', subject: 'Matematika', score: 94 };

export function CertificateTemplateView() {
  const t = useTranslations('admin.certificateTemplate');
  const { data: template } = useCertificateTemplate();
  const updateTemplate = useUpdateCertificateTemplate();
  const [text, setText] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) setText(template.text);
  }, [template]);

  if (text === null) return null;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateTemplate.mutate({ text });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField label={t('text')} htmlFor="text">
              <Textarea id="text" ref={textareaRef} rows={5} value={text} onChange={(event) => setText(event.target.value)} />
              <p className="text-sm text-muted-foreground">{t('hint')}</p>
              <PlaceholderPicker
                textareaRef={textareaRef}
                value={text}
                onChange={setText}
                placeholders={PLACEHOLDER_TOKENS.map((token) => ({ token, label: t(`placeholders.${token}`) }))}
              />
              <TemplatePreview text={text} values={PREVIEW_VALUES} label={t('preview')} />
            </FormField>

            <Button type="submit" disabled={updateTemplate.isPending} className="self-start">
              {t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
