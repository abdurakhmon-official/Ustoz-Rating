'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { SubjectOutput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { assetUrl } from '@/lib/utils';
import { useUploadDirect } from '@/hooks/use-upload';
import { useAdminSubjects, useCreateSubject, useUpdateSubject } from '@/hooks/use-subjects';

export function AdminSubjectListView() {
  const t = useTranslations('admin.subjects');
  const { data: subjects } = useAdminSubjects();
  const [adding, setAdding] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectOutput | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button size="sm" onClick={() => setAdding(true)}>
          {t('add')}
        </Button>
      </div>

      {!subjects?.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onEdit={() => setEditingSubject(subject)} />
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title={t('add')}>
        <SubjectForm onDone={() => setAdding(false)} />
      </Modal>

      <Modal open={!!editingSubject} onClose={() => setEditingSubject(null)} title={t('edit')}>
        {editingSubject && <SubjectForm subject={editingSubject} onDone={() => setEditingSubject(null)} />}
      </Modal>
    </div>
  );
}

function SubjectCard({ subject, onEdit }: { subject: SubjectOutput; onEdit: () => void }) {
  const t = useTranslations('admin.subjects');
  const updateSubject = useUpdateSubject();

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent text-accent-foreground">
            {subject.imageKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(subject.imageKey)} alt={subject.name} className="size-full object-cover" />
            ) : (
              <span className="text-lg font-semibold">{subject.name.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{subject.name}</p>
            <Badge variant={subject.isActive ? 'success' : 'danger'}>{subject.isActive ? t('active') : t('inactive')}</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            {t('edit')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateSubject.mutate({ subjectId: subject.id, input: { isActive: !subject.isActive } })
            }
          >
            {subject.isActive ? t('deactivate') : t('activate')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectForm({ subject, onDone }: { subject?: SubjectOutput; onDone: () => void }) {
  const t = useTranslations('admin.subjects');
  const [name, setName] = useState(subject?.name ?? '');
  const [imageKey, setImageKey] = useState<string | null | undefined>(subject?.imageKey);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDirect();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  const isPending = upload.isPending || createSubject.isPending || updateSubject.isPending;

  const onImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const uploaded = await upload.mutateAsync({ folder: 'subject', file });
    setImageKey(uploaded.key);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    if (subject) {
      await updateSubject.mutateAsync({ subjectId: subject.id, input: { name, imageKey } });
    } else {
      await createSubject.mutateAsync({ name, imageKey });
    }

    onDone();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label={t('name')} htmlFor="subject-name">
        <Input id="subject-name" placeholder={t('namePlaceholder')} value={name} onChange={(event) => setName(event.target.value)} autoFocus />
      </FormField>

      <FormField label={t('image')} htmlFor="subject-image">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-accent text-accent-foreground">
            {imageKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(imageKey)} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">{t('noImage')}</span>
            )}
          </div>
          <input ref={fileInputRef} id="subject-image" type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
          <Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => fileInputRef.current?.click()}>
            {t('changeImage')}
          </Button>
        </div>
      </FormField>

      <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          {t('cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
}
