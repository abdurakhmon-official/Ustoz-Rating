'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { DistrictOutput, RegionOutput, SchoolOutput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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

function ColumnHeader({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-base">{title}</CardTitle>
      <Button type="button" variant="outline" size="sm" onClick={onAdd} aria-label={addLabel}>
        <Plus className="size-4" />
      </Button>
    </CardHeader>
  );
}

function AddNameModal({
  open,
  onClose,
  title,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (name: string) => Promise<unknown>;
  isPending: boolean;
}) {
  const t = useTranslations('admin.geo');
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    await onSubmit(name.trim());
    setName('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label={t('name')} htmlFor="geo-name">
          <Input id="geo-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('namePlaceholder')} autoFocus />
        </FormField>

        <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={isPending || !name.trim()}>
            {isPending ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Modal>
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
  const [adding, setAdding] = useState(false);
  const createRegion = useCreateRegion();
  const deleteRegion = useDeleteRegion();

  return (
    <Card>
      <ColumnHeader title={t('regions')} addLabel={t('addRegion')} onAdd={() => setAdding(true)} />
      <CardContent className="flex flex-col gap-2">
        {!regions.length && <p className="text-sm text-muted-foreground">{t('emptyRegions')}</p>}

        {regions.map((region) => (
          <GeoRow key={region.id} label={region.name} active={region.id === selectedId} onClick={() => onSelect(region.id)} onDelete={() => deleteRegion.mutate(region.id)} />
        ))}
      </CardContent>

      <AddNameModal
        open={adding}
        onClose={() => setAdding(false)}
        title={t('addRegion')}
        isPending={createRegion.isPending}
        onSubmit={(name) => createRegion.mutateAsync({ name })}
      />
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
  const [adding, setAdding] = useState(false);
  const createDistrict = useCreateDistrict();
  const deleteDistrict = useDeleteDistrict();

  return (
    <Card>
      <ColumnHeader title={t('districts')} addLabel={t('addDistrict')} onAdd={() => setAdding(true)} />
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
      </CardContent>

      {regionId && (
        <AddNameModal
          open={adding}
          onClose={() => setAdding(false)}
          title={t('addDistrict')}
          isPending={createDistrict.isPending}
          onSubmit={(name) => createDistrict.mutateAsync({ name, regionId })}
        />
      )}
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
  const [adding, setAdding] = useState(false);
  const createSchool = useCreateSchool();
  const deleteSchool = useDeleteSchool();

  return (
    <Card>
      <ColumnHeader title={t('schools')} addLabel={t('addSchool')} onAdd={() => setAdding(true)} />
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
      </CardContent>

      {regionId && districtId && (
        <AddNameModal
          open={adding}
          onClose={() => setAdding(false)}
          title={t('addSchool')}
          isPending={createSchool.isPending}
          onSubmit={(name) => createSchool.mutateAsync({ name, regionId, districtId })}
        />
      )}
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
