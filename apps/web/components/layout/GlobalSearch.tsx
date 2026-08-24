'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useSearch } from '@/hooks/use-search';

export function GlobalSearch() {
  const t = useTranslations('search');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isFetching } = useSearch(q);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const groups = data
    ? [
        { key: 'teachers', label: t('groups.teachers'), items: data.teachers },
        { key: 'schools', label: t('groups.schools'), items: data.schools },
        { key: 'subjects', label: t('groups.subjects'), items: data.subjects },
        { key: 'districts', label: t('groups.districts'), items: data.districts },
        { key: 'regions', label: t('groups.regions'), items: data.regions },
      ].filter((group) => group.items.length > 0)
    : [];

  const showPanel = open && q.trim().length > 1;

  return (
    <div className="relative w-full max-w-xs" ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t('placeholder')}
          className="h-9 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {showPanel && (
        <div className="absolute right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {isFetching && !data ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('loading')}</p>
          ) : groups.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('empty')}</p>
          ) : (
            groups.map((group) => (
              <div key={group.key} className="border-b border-border py-2 last:border-b-0">
                <p className="px-4 pb-1 text-xs font-semibold text-muted-foreground uppercase">{group.label}</p>
                {group.items.map((item) => (
                  <div key={item.id} className="flex flex-col px-4 py-1.5 text-sm">
                    <span>{item.label}</span>
                    {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
