'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { DistrictOutput, RegionOutput, SchoolOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
  useCreateDistrict,
  useCreateRegion,
  useCreateSchool,
  useDeleteDistrict,
  useDeleteRegion,
  useDeleteSchool,
  useDistricts,
  useRegions,
  useSchools,
} from '@/hooks/use-geo';

export function AdminGeoView() {
  const t = useTranslations('admin.geo');
  const [regionId, setRegionId] = useState<string | undefined>();
  const [districtId, setDistrictId] = useState<string | undefined>();

  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(regionId);
  const { data: schools } = useSchools(districtId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RegionColumn
          regions={regions ?? []}
          selectedId={regionId}
          onSelect={(id) => {
            setRegionId(id);
            setDistrictId(undefined);
          }}
        />

        <DistrictColumn regionId={regionId} districts={districts ?? []} selectedId={districtId} onSelect={setDistrictId} />

        <SchoolColumn regionId={regionId} districtId={districtId} schools={schools ?? []} />
      </div>
    </div>
  );
}

function RegionColumn({
  regions,
  selectedId,
  onSelect,
}: {
  regions: RegionOutput[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations('admin.geo');
  const [name, setName] = useState('');
  const createRegion = useCreateRegion();
  const deleteRegion = useDeleteRegion();

  const onAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createRegion.mutateAsync({ name });
    setName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('regions')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!regions.length && <p className="text-sm text-muted-foreground">{t('emptyRegions')}</p>}

        {regions.map((region) => (
          <GeoRow key={region.id} label={region.name} active={region.id === selectedId} onClick={() => onSelect(region.id)} onDelete={() => deleteRegion.mutate(region.id)} />
        ))}

        <form onSubmit={onAdd} className="mt-2 flex gap-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} className="h-9" />
          <Button type="submit" size="sm" disabled={createRegion.isPending}>
            {t('addRegion')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DistrictColumn({
  regionId,
  districts,
  selectedId,
  onSelect,
}: {
  regionId: string | undefined;
  districts: DistrictOutput[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations('admin.geo');
  const [name, setName] = useState('');
  const createDistrict = useCreateDistrict();
  const deleteDistrict = useDeleteDistrict();

  const onAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !regionId) return;
    await createDistrict.mutateAsync({ name, regionId });
    setName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('districts')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!regionId ? (
          <p className="text-sm text-muted-foreground">{t('selectRegion')}</p>
        ) : !districts.length ? (
          <p className="text-sm text-muted-foreground">{t('emptyDistricts')}</p>
        ) : (
          districts.map((district) => (
            <GeoRow
              key={district.id}
              label={district.name}
              active={district.id === selectedId}
              onClick={() => onSelect(district.id)}
              onDelete={() => deleteDistrict.mutate({ districtId: district.id, regionId: district.regionId })}
            />
          ))
        )}

        {regionId && (
          <form onSubmit={onAdd} className="mt-2 flex gap-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} className="h-9" />
            <Button type="submit" size="sm" disabled={createDistrict.isPending}>
              {t('addDistrict')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function SchoolColumn({
  regionId,
  districtId,
  schools,
}: {
  regionId: string | undefined;
  districtId: string | undefined;
  schools: SchoolOutput[];
}) {
  const t = useTranslations('admin.geo');
  const [name, setName] = useState('');
  const createSchool = useCreateSchool();
  const deleteSchool = useDeleteSchool();

  const onAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !regionId || !districtId) return;
    await createSchool.mutateAsync({ name, regionId, districtId });
    setName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('schools')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!districtId ? (
          <p className="text-sm text-muted-foreground">{t('selectDistrict')}</p>
        ) : !schools.length ? (
          <p className="text-sm text-muted-foreground">{t('emptySchools')}</p>
        ) : (
          schools.map((school) => (
            <GeoRow
              key={school.id}
              label={school.name}
              onDelete={() => deleteSchool.mutate({ schoolId: school.id, districtId: school.districtId })}
            />
          ))
        )}

        {districtId && (
          <form onSubmit={onAdd} className="mt-2 flex gap-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} className="h-9" />
            <Button type="submit" size="sm" disabled={createSchool.isPending}>
              {t('addSchool')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function GeoRow({
  label,
  active,
  onClick,
  onDelete,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('admin.geo');

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm',
        onClick && 'cursor-pointer hover:bg-accent',
        active && 'border-primary bg-accent',
      )}
      onClick={onClick}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="shrink-0 text-xs text-destructive hover:underline"
      >
        {t('delete')}
      </button>
    </div>
  );
}
