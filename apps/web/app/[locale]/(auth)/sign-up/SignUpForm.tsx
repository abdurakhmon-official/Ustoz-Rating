'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { SignupInputSchema, type SignupInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { errorFrom } from '@/lib/errors';
import { messageFor } from '@/lib/messages';
import { useRouter } from '@/i18n/navigation';
import { useSignUp } from '@/hooks/use-auth';
import { useDistricts, useRegions, useSchools } from '@/hooks/use-geo';
import { useSubjects } from '@/hooks/use-subjects';

/** Forma to'ldirilmasdan oldingi shakl — `locale` hali default qo'yilmagan, ixtiyoriy. */
type SignUpFormValues = z.input<typeof SignupInputSchema>;

export function SignUpForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const signUp = useSignUp();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignupInputSchema),
  });

  const regionId = watch('regionId');
  const districtId = watch('districtId');
  const schoolId = watch('schoolId');
  const subjectId = watch('subjectId');
  const gender = watch('gender');
  const [newSchool, setNewSchool] = useState(false);

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(regionId);
  const { data: schools } = useSchools(districtId);
  const { data: subjects } = useSubjects();

  useEffect(() => {
    setValue('districtId', '' as SignUpFormValues['districtId']);
    setValue('schoolId', '' as SignUpFormValues['schoolId']);
    setValue('schoolName', undefined);
    setNewSchool(false);
  }, [regionId, setValue]);

  useEffect(() => {
    setValue('schoolId', '' as SignUpFormValues['schoolId']);
    setValue('schoolName', undefined);
    setNewSchool(false);
  }, [districtId, setValue]);

  const toggleNewSchool = () => {
    setValue('schoolId', '' as SignUpFormValues['schoolId']);
    setValue('schoolName', undefined);
    setNewSchool((value) => !value);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp.mutateAsync(data as SignupInput);
      router.push('/verify-email');
    } catch (error) {
      const detail = errorFrom(error);
      setError('root', { message: detail.message });
    }
  });

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>{t('signUp.title')}</CardTitle>
        <CardDescription>{t('signUp.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-sm font-semibold text-foreground">{t('sections.personal')}</legend>

            <FormField label={t('fields.fullName')} htmlFor="fullName" error={errors.fullName?.message}>
              <Input id="fullName" autoComplete="name" {...register('fullName')} />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('fields.email')} htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...register('email')} />
              </FormField>

              <FormField label={t('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
                <Input id="phone" type="tel" placeholder="+998 90 123 45 67" autoComplete="tel" {...register('phone')} />
              </FormField>
            </div>

            <FormField label={t('fields.password')} htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            </FormField>

            <FormField label={t('fields.gender')} htmlFor="gender" error={errors.gender?.message}>
              <RadioGroup
                name="gender"
                value={gender}
                onChange={(value) => setValue('gender', value as SignUpFormValues['gender'])}
                className="flex-row"
                options={[
                  { value: 'MALE', label: t('fields.genderMale') },
                  { value: 'FEMALE', label: t('fields.genderFemale') },
                ]}
              />
            </FormField>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-sm font-semibold text-foreground">{t('sections.workplace')}</legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('fields.region')} htmlFor="regionId" error={errors.regionId?.message}>
                <Select id="regionId" value={regionId ?? ''} onChange={(value) => setValue('regionId', value as SignUpFormValues['regionId'])}>
                  <option value="">{t('fields.selectPlaceholder')}</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t('fields.district')} htmlFor="districtId" error={errors.districtId?.message}>
                <Select
                  id="districtId"
                  disabled={!regionId}
                  value={districtId ?? ''}
                  onChange={(value) => setValue('districtId', value as SignUpFormValues['districtId'])}
                >
                  <option value="">{t('fields.selectPlaceholder')}</option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField
              label={t('fields.school')}
              htmlFor="schoolId"
              error={messageFor(errors.schoolId?.message ?? errors.schoolName?.message, errors.schoolId?.message ?? errors.schoolName?.message) ?? undefined}
            >
              {newSchool ? (
                <Input id="schoolId" placeholder={t('fields.schoolNamePlaceholder')} disabled={!districtId} {...register('schoolName')} />
              ) : (
                <Select
                  id="schoolId"
                  disabled={!districtId}
                  value={String(schoolId ?? '')}
                  onChange={(value) => setValue('schoolId', value as SignUpFormValues['schoolId'])}
                >
                  <option value="">{t('fields.selectPlaceholder')}</option>
                  {schools?.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </Select>
              )}
              <button
                type="button"
                onClick={toggleNewSchool}
                disabled={!districtId}
                className="self-start text-sm text-primary hover:underline disabled:opacity-50"
              >
                {newSchool ? t('fields.chooseFromList') : t('fields.schoolNotListed')}
              </button>
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('fields.subject')} htmlFor="subjectId" error={errors.subjectId?.message}>
                <Select id="subjectId" value={subjectId ?? ''} onChange={(value) => setValue('subjectId', value as SignUpFormValues['subjectId'])}>
                  <option value="">{t('fields.selectPlaceholder')}</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t('fields.experienceYears')} htmlFor="experienceYears" error={errors.experienceYears?.message}>
                <Input id="experienceYears" type="number" min={0} max={60} {...register('experienceYears')} />
              </FormField>
            </div>

            <FormField label={t('fields.position')} htmlFor="position" error={errors.position?.message}>
              <Input id="position" {...register('position')} />
            </FormField>
          </fieldset>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={signUp.isPending} className="mt-2">
            {signUp.isPending ? t('signUp.loading') : t('signUp.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
