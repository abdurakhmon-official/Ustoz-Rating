'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { AdminUserListItem, UserRole } from '@repo/contracts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Link } from '@/i18n/navigation';
import { useAdminUsers, useDeleteAdminUser, useSetUserActive, useUpdateUserRole } from '@/hooks/use-user';
import { useSession } from '@/hooks/use-auth';
import { useRegions } from '@/hooks/use-geo';
import { useSubjects } from '@/hooks/use-subjects';

const ROLES: UserRole[] = ['ADMIN', 'TEACHER'];

export function AdminUserListView() {
  const t = useTranslations('admin.users');
  const { user: currentUser } = useSession();
  const { data: regions } = useRegions();
  const { data: subjects } = useSubjects();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [regionId, setRegionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);

  const { data } = useAdminUsers({
    search: search || undefined,
    role: role || undefined,
    regionId: regionId || undefined,
    subjectId: subjectId || undefined,
    page,
  });
  const updateRole = useUpdateUserRole();
  const setActive = useSetUserActive();
  const deleteUser = useDeleteAdminUser();

  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link href="/admin/users/new">
          <Button size="sm">{t('add')}</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('search')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
          className="max-w-xs"
        />
        <Select
          value={role}
          onChange={(value) => {
            setRole(value as UserRole | '');
            resetPage();
          }}
          className="max-w-40"
        >
          <option value="">{t('allRoles')}</option>
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {t(`role.${item}`)}
            </option>
          ))}
        </Select>
        <Select
          value={regionId}
          onChange={(value) => {
            setRegionId(value);
            resetPage();
          }}
          className="max-w-44"
        >
          <option value="">{t('allRegions')}</option>
          {regions?.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </Select>
        <Select
          value={subjectId}
          onChange={(value) => {
            setSubjectId(value);
            resetPage();
          }}
          className="max-w-44"
        >
          <option value="">{t('allSubjects')}</option>
          {subjects?.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>

      {!data?.data.length ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((item) => (
            <UserRow
              key={item.id}
              user={item}
              isSelf={item.id === currentUser?.id}
              onRoleChange={(nextRole) => updateRole.mutate({ userId: item.id, input: { role: nextRole } })}
              onActiveToggle={() => setActive.mutate({ userId: item.id, input: { active: !item.active } })}
              onDelete={() => {
                // eslint-disable-next-line no-alert
                if (window.confirm(t('confirmDelete'))) deleteUser.mutate(item.id);
              }}
            />
          ))}
        </div>
      )}

      {data && <Pagination page={page} total={data.meta.total} limit={data.meta.limit} onPageChange={setPage} />}
    </div>
  );
}

// interfaces

interface UserRowProps {
  user: AdminUserListItem;
  isSelf: boolean;
  onRoleChange: (role: UserRole) => void;
  onActiveToggle: () => void;
  onDelete: () => void;
}

function UserRow({ user, isSelf, onRoleChange, onActiveToggle, onDelete }: UserRowProps) {
  const t = useTranslations('admin.users');

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium">{user.fullName}</p>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[user.subjectName, user.schoolName, user.regionName].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* `<option value>` ro'yxati pastda `ROLES`dan generatsiya qilinadi, shuning uchun qiymat doim shu union'ga mos. */}
        <Select value={user.role} disabled={isSelf} onChange={(value) => onRoleChange(value as UserRole)} className="w-36">
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {t(`role.${item}`)}
            </option>
          ))}
        </Select>
        <Badge variant={user.active ? 'success' : 'danger'}>{user.active ? t('active') : t('inactive')}</Badge>
        <Link href={{ pathname: '/admin/users/[userId]', params: { userId: user.id } }}>
          <Button size="sm" variant="outline">
            {t('viewProfile')}
          </Button>
        </Link>
        <Button size="sm" variant="outline" disabled={isSelf} onClick={onActiveToggle}>
          {user.active ? t('deactivate') : t('activate')}
        </Button>
        <Button size="sm" variant="outline" disabled={isSelf} onClick={onDelete}>
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}
