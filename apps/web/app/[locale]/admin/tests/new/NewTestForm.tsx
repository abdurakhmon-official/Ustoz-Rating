'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CreateTestInputSchema, type CreateTestInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { errorFrom } from '@/lib/errors';
import { useRouter } from '@/i18n/navigation';
import { useSubjects } from '@/hooks/use-subjects';
import { useCreateTest } from '@/hooks/use-tests';

export function NewTestForm() {
  const t = useTranslations('admin.tests');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const { data: subjects } = useSubjects();
  const createTest = useCreateTest();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateTestInput>({ resolver: zodResolver(CreateTestInputSchema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const test = await createTest.mutateAsync(data);
      router.push({ pathname: '/admin/tests/[testId]', params: { testId: test.id } });
    } catch (error) {
      const detail = errorFrom(error);
      setError('root', { message: detail.message });
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('add')}</CardTitle>
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

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

            <Button type="submit" disabled={createTest.isPending} className="mt-2 self-start">
              {t('create')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
