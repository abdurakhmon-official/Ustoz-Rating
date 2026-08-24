'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { UpdateProfileInputSchema, type UpdateProfileInput } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Select } from '@/components/ui/Select';
import { assetUrl } from '@/lib/utils';
import { useSession } from '@/hooks/use-auth';
import { useUpdateProfile } from '@/hooks/use-user';
import { useUploadDirect } from '@/hooks/use-upload';
import { useDistricts, useRegions, useSchools } from '@/hooks/use-geo';
import { useSubjects } from '@/hooks/use-subjects';

export function ProfileView() {
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const { user } = useSession();
  const updateProfile = useUpdateProfile();
  const upload = useUploadDirect();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({ resolver: zodResolver(UpdateProfileInputSchema) });

  useEffect(() => {
    if (!user) return;

    reset({
      phone: user.phone ?? undefined,
      gender: user.gender ?? undefined,
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
  const gender = watch('gender');

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(regionId);
  const { data: schools } = useSchools(districtId);
  const { data: subjects } = useSubjects();

  if (!user) return null;

  const onRegionChange = (nextRegionId: string) => {
    setValue('regionId', nextRegionId);
    setValue('districtId', undefined);
    setValue('schoolId', undefined);
  };

  const onDistrictChange = (nextDistrictId: string) => {
    setValue('districtId', nextDistrictId);
    setValue('schoolId', undefined);
  };

  const onAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const uploaded = await upload.mutateAsync({ folder: 'avatar', file });
    await updateProfile.mutateAsync({ avatar: uploaded.key });
  };

  const onSubmit = handleSubmit((data) => updateProfile.mutateAsync(data));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-semibold text-accent-foreground"
            aria-label={t('uploadAvatar')}
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(user.avatar)} alt={user.fullName} className="size-full object-cover" />
            ) : (
              user.fullName.charAt(0).toUpperCase()
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarSelected} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{user.fullName}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{t(`role.${user.role}`)}</Badge>
              <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                {user.emailVerified ? t('emailVerified') : t('emailNotVerified')}
              </Badge>
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => fileInputRef.current?.click()}>
            {upload.isPending ? t('uploading') : t('uploadAvatar')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.phone')} htmlFor="phone" error={errors.phone?.message}>
                <Input id="phone" type="tel" {...register('phone')} />
              </FormField>

              <FormField label={tAuth('fields.gender')} htmlFor="gender" error={errors.gender?.message}>
                <RadioGroup
                  name="gender"
                  value={gender}
                  onChange={(value) => setValue('gender', value as UpdateProfileInput['gender'])}
                  className="flex-row"
                  options={[
                    { value: 'MALE', label: tAuth('fields.genderMale') },
                    { value: 'FEMALE', label: tAuth('fields.genderFemale') },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={tAuth('fields.region')} htmlFor="regionId" error={errors.regionId?.message}>
                <Select id="regionId" value={regionId ?? ''} onChange={(event) => onRegionChange(event.target.value)}>
                  <option value="">{tAuth('fields.selectPlaceholder')}</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={tAuth('fields.district')} htmlFor="districtId" error={errors.districtId?.message}>
                <Select id="districtId" disabled={!regionId} value={districtId ?? ''} onChange={(event) => onDistrictChange(event.target.value)}>
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

            <Button type="submit" disabled={updateProfile.isPending} className="mt-2 self-start">
              {updateProfile.isPending ? t('saving') : t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
