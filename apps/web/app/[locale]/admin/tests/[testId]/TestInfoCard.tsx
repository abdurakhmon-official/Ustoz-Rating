'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UpdateTestInputSchema, type AdminTestDetail, type UpdateTestInput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useSubjects } from '@/hooks/use-subjects';
import { useUpdateTest } from '@/hooks/use-tests';

export function TestInfoCard({ test }: { test: AdminTestDetail }) {
  const t = useTranslations('admin.tests');
  const tAuth = useTranslations('auth');
  const { data: subjects } = useSubjects();
  const updateTest = useUpdateTest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateTestInput>({ resolver: zodResolver(UpdateTestInputSchema) });

  useEffect(() => {
    reset({
      title: test.title,
      subjectId: test.subjectId,
      description: test.description ?? undefined,
      durationMinutes: test.durationMinutes,
      passingScore: test.passingScore,
    });
  }, [test, reset]);

  const onSubmit = handleSubmit((data) => updateTest.mutateAsync({ testId: test.id, input: data }));

  const togglePublish = () => {
    const nextStatus = test.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    updateTest.mutate({ testId: test.id, input: { status: nextStatus } });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{test.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={test.status === 'PUBLISHED' ? 'success' : 'warning'}>{t(`status.${test.status}`)}</Badge>
          <Button size="sm" variant="outline" onClick={togglePublish} disabled={updateTest.isPending}>
            {test.status === 'PUBLISHED' ? t('unpublish') : t('publish')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label={t('fields.title')} htmlFor="title" error={errors.title?.message}>
            <Input id="title" {...register('title')} />
          </FormField>

          <FormField label={t('fields.subject')} htmlFor="subjectId" error={errors.subjectId?.message}>
            <Select id="subjectId" {...register('subjectId')}>
              <option value="">{tAuth('fields.selectPlaceholder')}</option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t('fields.description')} htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" {...register('description')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('fields.durationMinutes')} htmlFor="durationMinutes" error={errors.durationMinutes?.message}>
              <Input id="durationMinutes" type="number" min={1} max={300} {...register('durationMinutes')} />
            </FormField>

            <FormField label={t('fields.passingScore')} htmlFor="passingScore" error={errors.passingScore?.message}>
              <Input id="passingScore" type="number" min={1} max={100} {...register('passingScore')} />
            </FormField>
          </div>

          <Button type="submit" size="sm" disabled={updateTest.isPending} className="self-start">
            {t('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
