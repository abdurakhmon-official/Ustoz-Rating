'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AdminUpdateUserInputSchema, type AdminUpdateUserInput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Link } from '@/i18n/navigation';
import { useAdminUser, useAdminUserAttempts, useUpdateAdminUser } from '@/hooks/use-user';
import { useDistricts, useRegions, useSchools } from '@/hooks/use-geo';
import { useSubjects } from '@/hooks/use-subjects';

export function AdminUserDetailView({ userId }: { userId: string }) {
  const t = useTranslations('admin.userDetail');
  const tUsers = useTranslations('admin.users');
  const tAuth = useTranslations('auth');
  const tAttempts = useTranslations('attempts');
  const { data: user } = useAdminUser(userId);
  const { data: attempts } = useAdminUserAttempts(userId);
  const updateUser = useUpdateAdminUser();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdminUpdateUserInput>({ resolver: zodResolver(AdminUpdateUserInputSchema) });

  useEffect(() => {
    if (!user) return;

    reset({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? undefined,
      regionId: user.regionId ?? undefined,
      districtId: user.districtId ?? undefined,
      schoolId: user.schoolId ?? undefined,
      subjectId: user.subjectId ?? undefined,
      position: user.position ?? undefined,
      experienceYears: user.experienceYears ?? undefined,
    });
  }, [user, reset]);

  const regionId = watch('regionId');
  const districtId = watch('districtId');
  const schoolId = watch('schoolId');
  const subjectId = watch('subjectId');

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(regionId);
  const { data: schools } = useSchools(districtId);
  const { data: subjects } = useSubjects();

  if (!user) return null;

  const onSubmit = handleSubmit((data) => updateUser.mutateAsync({ userId, input: data }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link href="/admin/users" className="text-sm text-muted-foreground hover:underline">
        ← {t('back')}
      </Link>

      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <p className="text-lg font-semibold">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge>{tUsers(`role.${user.role}`)}</Badge>
            <Badge variant={user.active ? 'success' : 'danger'}>{user.active ? tUsers('active') : tUsers('inactive')}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.fullName')} htmlFor="fullName" error={errors.fullName?.message}>
                <Input id="fullName" {...register('fullName')} />
              </FormField>
              <FormField label={tAuth('fields.email')} htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} />
              </FormField>
            </div>

            <FormField label={tAuth('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register('phone')} />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.region')} htmlFor="regionId" error={errors.regionId?.message}>
                <Select id="regionId" value={regionId ?? ''} onChange={(value) => setValue('regionId', value)}>
                  <option value="">{tAuth('fields.selectPlaceholder')}</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={tAuth('fields.district')} htmlFor="districtId" error={errors.districtId?.message}>
                <Select id="districtId" disabled={!regionId} value={districtId ?? ''} onChange={(value) => setValue('districtId', value)}>
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
              <Select id="schoolId" disabled={!districtId} value={schoolId ?? ''} onChange={(value) => setValue('schoolId', value)}>
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
                <Select id="subjectId" value={subjectId ?? ''} onChange={(value) => setValue('subjectId', value)}>
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

            <Button type="submit" size="sm" disabled={updateUser.isPending} className="self-start">
              {t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('attemptsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!attempts?.length ? (
            <p className="text-sm text-muted-foreground">{t('attemptsEmpty')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div>
                    <p className="font-medium">{attempt.testTitle}</p>
                    <p className="text-muted-foreground">
                      {attempt.subjectName} · {new Date(attempt.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{attempt.score}%</span>
                    <Badge variant={attempt.passed ? 'success' : 'danger'}>{attempt.passed ? tAttempts('status.passed') : tAttempts('status.failed')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
