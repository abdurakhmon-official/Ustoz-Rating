'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { SubjectOutput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { assetUrl } from '@/lib/utils';
import { useUploadDirect } from '@/hooks/use-upload';
import { useAdminSubjects, useCreateSubject, useDeleteSubject, useUpdateSubject } from '@/hooks/use-subjects';

export function AdminSubjectListView() {
  const t = useTranslations('admin.subjects');
  const { data: subjects } = useAdminSubjects();
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button size="sm" onClick={() => setAdding((value) => !value)}>
          {t('add')}
        </Button>
      </div>

      {adding && <SubjectForm onDone={() => setAdding(false)} />}

      {!subjects?.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject }: { subject: SubjectOutput }) {
  const t = useTranslations('admin.subjects');
  const [editing, setEditing] = useState(false);
  const updateSubject = useUpdateSubject();

  if (editing) {
    return <SubjectForm subject={subject} onDone={() => setEditing(false)} />;
  }

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
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
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
    <Card>
      <CardContent className="py-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="subject-name">
              {t('name')}
            </label>
            <Input id="subject-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              {t('image')}
            </Button>
            {imageKey && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(imageKey)} alt="" className="size-9 rounded object-cover" />
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
