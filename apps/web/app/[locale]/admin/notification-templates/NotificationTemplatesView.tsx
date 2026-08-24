'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { NotificationTemplateItem, NotificationType } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PlaceholderPicker } from '@/components/ui/PlaceholderPicker';
import { TemplatePreview } from '@/components/ui/TemplatePreview';
import { Textarea } from '@/components/ui/Textarea';
import { useNotificationTemplates, useUpdateNotificationTemplate } from '@/hooks/use-notifications';

const TYPE_PLACEHOLDER_TOKENS: Record<NotificationType, string[]> = {
  TEST_PUBLISHED: ['subject', 'title'],
  ATTEMPT_RESULT: ['title', 'score', 'status'],
  RATING_CHANGED: ['delta'],
  CERTIFICATE_ISSUED: ['subject', 'score'],
};

const TYPE_PREVIEW_VALUES: Record<NotificationType, Record<string, string | number>> = {
  TEST_PUBLISHED: { subject: 'Matematika', title: 'Nazorat ishi' },
  ATTEMPT_RESULT: { title: 'Nazorat ishi', score: 87, status: "o'tdi" },
  RATING_CHANGED: { delta: 3 },
  CERTIFICATE_ISSUED: { subject: 'Matematika', score: 94 },
};

function TemplateCard({ template }: { template: NotificationTemplateItem }) {
  const t = useTranslations('admin.notificationTemplates');
  const updateTemplate = useUpdateNotificationTemplate();
  const [text, setText] = useState(template.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateTemplate.mutate({ type: template.type, input: { text } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t(`type.${template.type}`)}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Textarea ref={textareaRef} rows={3} value={text} onChange={(event) => setText(event.target.value)} />
          <p className="text-sm text-muted-foreground">{t('hint')}</p>
          <PlaceholderPicker
            textareaRef={textareaRef}
            value={text}
            onChange={setText}
            placeholders={TYPE_PLACEHOLDER_TOKENS[template.type].map((token) => ({ token, label: t(`placeholders.${token}`) }))}
          />
          <TemplatePreview text={text} values={TYPE_PREVIEW_VALUES[template.type]} label={t('preview')} />
          <Button type="submit" size="sm" disabled={updateTemplate.isPending} className="self-start">
            {t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function NotificationTemplatesView() {
  const t = useTranslations('admin.notificationTemplates');
  const { data: templates } = useNotificationTemplates();

  if (!templates) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      {templates.map((template) => (
        <TemplateCard key={template.type} template={template} />
      ))}
    </div>
  );
}
