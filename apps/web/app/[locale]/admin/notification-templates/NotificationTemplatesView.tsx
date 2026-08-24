'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { NotificationTemplateItem } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useNotificationTemplates, useUpdateNotificationTemplate } from '@/hooks/use-notifications';

function TemplateCard({ template }: { template: NotificationTemplateItem }) {
  const t = useTranslations('admin.notificationTemplates');
  const updateTemplate = useUpdateNotificationTemplate();
  const [text, setText] = useState(template.text);

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
          <Textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} />
          <p className="text-sm text-muted-foreground">{t(`hint.${template.type}`)}</p>
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
