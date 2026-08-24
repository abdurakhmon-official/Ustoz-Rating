'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { RatingPeriod } from '@repo/contracts';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { RankBadge } from '@/components/ui/RankBadge';
import { Select } from '@/components/ui/Select';
import { useSession } from '@/hooks/use-auth';
import { useDistricts, useRegions, useSchools } from '@/hooks/use-geo';
import { useMyRating, useRatings } from '@/hooks/use-ratings';
import { useSubjects } from '@/hooks/use-subjects';
import { MyRatingCard } from './MyRatingCard';

export function RatingView() {
  const t = useTranslations('rating');
  const { isAuthenticated, user } = useSession();

  const [regionId, setRegionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gender, setGender] = useState('');
  const [experienceMin, setExperienceMin] = useState('');
  const [period, setPeriod] = useState<RatingPeriod>('all');
  const [page, setPage] = useState(1);

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(regionId || undefined);
  const { data: schools } = useSchools(districtId || undefined);
  const { data: subjects } = useSubjects();
  const { data: myRating } = useMyRating();

  const { data } = useRatings({
    regionId: regionId || undefined,
    districtId: districtId || undefined,
    schoolId: schoolId || undefined,
    subjectId: subjectId || undefined,
    gender: (gender as 'MALE' | 'FEMALE' | '') || undefined,
    experienceMin: experienceMin ? Number(experienceMin) : undefined,
    period,
    page,
  });

  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {isAuthenticated && user?.role === 'TEACHER' && myRating && <MyRatingCard rating={myRating} />}

      <div className="flex flex-wrap gap-3">
        <Select
          value={regionId}
          onChange={(event) => {
            setRegionId(event.target.value);
            setDistrictId('');
            setSchoolId('');
            resetPage();
          }}
          className="max-w-44"
        >
          <option value="">{t('filters.allRegions')}</option>
          {regions?.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </Select>

        <Select
          value={districtId}
          disabled={!regionId}
          onChange={(event) => {
            setDistrictId(event.target.value);
            setSchoolId('');
            resetPage();
          }}
          className="max-w-44"
        >
          <option value="">{t('filters.allDistricts')}</option>
          {districts?.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </Select>

        <Select
          value={schoolId}
          disabled={!districtId}
          onChange={(event) => {
            setSchoolId(event.target.value);
            resetPage();
          }}
          className="max-w-44"
        >
          <option value="">{t('filters.allSchools')}</option>
          {schools?.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </Select>

        <Select
          value={subjectId}
          onChange={(event) => {
            setSubjectId(event.target.value);
            resetPage();
          }}
          className="max-w-44"
        >
          <option value="">{t('filters.allSubjects')}</option>
          {subjects?.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>

        <Select
          value={gender}
          onChange={(event) => {
            setGender(event.target.value);
            resetPage();
          }}
          className="max-w-36"
        >
          <option value="">{t('filters.allGenders')}</option>
          <option value="MALE">{t('filters.male')}</option>
          <option value="FEMALE">{t('filters.female')}</option>
        </Select>

        <Input
          type="number"
          min={0}
          placeholder={t('filters.experienceMin')}
          value={experienceMin}
          onChange={(event) => {
            setExperienceMin(event.target.value);
            resetPage();
          }}
          className="max-w-36"
        />

        <Select
          value={period}
          onChange={(event) => {
            setPeriod(event.target.value as RatingPeriod);
            resetPage();
          }}
          className="max-w-36"
        >
          <option value="all">{t('filters.period.all')}</option>
          <option value="week">{t('filters.period.week')}</option>
          <option value="month">{t('filters.period.month')}</option>
        </Select>
      </div>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((entry) => (
            <Card key={entry.teacherId}>
              <CardContent className="flex items-center gap-4 py-3">
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[entry.subjectName, entry.schoolName, entry.regionName].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">{entry.compositeScore}%</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}
