'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { AdminCreateUserInputSchema, type AdminCreateUserInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { errorFrom } from '@/lib/errors';
import { useRouter } from '@/i18n/navigation';
import { useCreateAdminUser } from '@/hooks/use-user';
import { useDistricts, useRegions, useSchools } from '@/hooks/use-geo';
import { useSubjects } from '@/hooks/use-subjects';

type NewUserFormValues = z.input<typeof AdminCreateUserInputSchema>;

export function NewUserForm() {
  const t = useTranslations('admin.userCreate');
  const tUsers = useTranslations('admin.users');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const createUser = useCreateAdminUser();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<NewUserFormValues>({ resolver: zodResolver(AdminCreateUserInputSchema), defaultValues: { role: 'TEACHER' } });

  const regionId = watch('regionId');
  const districtId = watch('districtId');

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(regionId);
  const { data: schools } = useSchools(districtId);
  const { data: subjects } = useSubjects();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const user = await createUser.mutateAsync(data as AdminCreateUserInput);
      router.push({ pathname: '/admin/users/[userId]', params: { userId: user.id } });
    } catch (error) {
      const detail = errorFrom(error);
      setError('root', { message: detail.message });
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <FormField label={tAuth('fields.fullName')} htmlFor="fullName" error={errors.fullName?.message}>
              <Input id="fullName" {...register('fullName')} />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.email')} htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} />
              </FormField>
              <FormField label={tAuth('fields.password')} htmlFor="password" error={errors.password?.message}>
                <Input id="password" type="password" {...register('password')} />
              </FormField>
            </div>

            <FormField label={t('roleLabel')} htmlFor="role" error={errors.role?.message}>
              <Select id="role" {...register('role')}>
                <option value="TEACHER">{tUsers('role.TEACHER')}</option>
                <option value="ADMIN">{tUsers('role.ADMIN')}</option>
              </Select>
            </FormField>

            <FormField label={tAuth('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register('phone')} />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.region')} htmlFor="regionId" error={errors.regionId?.message}>
                <Select id="regionId" {...register('regionId')}>
                  <option value="">{tAuth('fields.selectPlaceholder')}</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={tAuth('fields.district')} htmlFor="districtId" error={errors.districtId?.message}>
                <Select id="districtId" disabled={!regionId} {...register('districtId')}>
                  <option value="">{tAuth('fields.selectPlaceholder')}</option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label={tAuth('fields.school')} htmlFor="schoolId" error={errors.schoolId?.message}>
              <Select id="schoolId" disabled={!districtId} {...register('schoolId')}>
                <option value="">{tAuth('fields.selectPlaceholder')}</option>
                {schools?.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.subject')} htmlFor="subjectId" error={errors.subjectId?.message}>
                <Select id="subjectId" {...register('subjectId')}>
                  <option value="">{tAuth('fields.selectPlaceholder')}</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={tAuth('fields.experienceYears')} htmlFor="experienceYears" error={errors.experienceYears?.message}>
                <Input id="experienceYears" type="number" min={0} max={60} {...register('experienceYears')} />
              </FormField>
            </div>

            <FormField label={tAuth('fields.position')} htmlFor="position" error={errors.position?.message}>
              <Input id="position" {...register('position')} />
            </FormField>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

            <Button type="submit" disabled={createUser.isPending} className="mt-2 self-start">
              {t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
