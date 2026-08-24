'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useMarkNotificationRead, useNotifications } from '@/hooks/use-notifications';

export function NotificationBell() {
  const t = useTranslations('notifications');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative size-9 px-0"
        aria-label={t('title')}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">{t('title')}</div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('empty')}</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !item.read && markRead.mutate(item.id)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left text-sm last:border-b-0 hover:bg-accent',
                    !item.read && 'bg-accent/50',
                  )}
                >
                  <span className={cn(!item.read && 'font-medium')}>{item.text}</span>
                  <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
