'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { TestStatus } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Link } from '@/i18n/navigation';
import { useSubjects } from '@/hooks/use-subjects';
import { useAdminTests, useDeleteTest } from '@/hooks/use-tests';

export function AdminTestListView() {
  const t = useTranslations('admin.tests');
  const { data: subjects } = useSubjects();
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState<TestStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data } = useAdminTests({
    search: search || undefined,
    subjectId: subjectId || undefined,
    status: status || undefined,
    page,
  });
  const deleteTest = useDeleteTest();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link href="/admin/tests/new">
          <Button size="sm">{t('add')}</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('search')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={subjectId}
          onChange={(value) => {
            setSubjectId(value);
            setPage(1);
          }}
          className="max-w-48"
        >
          <option value="">{t('allSubjects')}</option>
          {subjects?.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(value) => {
            setStatus(value as TestStatus | '');
            setPage(1);
          }}
          className="max-w-44"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="DRAFT">{t('status.DRAFT')}</option>
          <option value="PUBLISHED">{t('status.PUBLISHED')}</option>
        </Select>
      </div>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((test) => (
            <div
              key={test.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{test.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {test.subjectName} · {t('questionCount', { count: test.questionCount })} · {t('duration', { minutes: test.durationMinutes })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={test.status === 'PUBLISHED' ? 'success' : 'warning'}>{t(`status.${test.status}`)}</Badge>
                <Link href={{ pathname: '/admin/tests/[testId]', params: { testId: test.id } }}>
                  <Button size="sm" variant="outline">
                    {t('edit')}
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => deleteTest.mutate(test.id)}>
                  {t('delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}
