'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function AdminSubNav() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();

  // add more tabs here as the admin panel grows
  const tabs = [
    { href: '/admin', label: t('dashboard') },
    { href: '/admin/users', label: t('users') },
    { href: '/admin/tests', label: t('tests') },
    { href: '/admin/subjects', label: t('subjects') },
    { href: '/admin/geo', label: t('geo') },
    { href: '/admin/rating-settings', label: t('ratingSettings') },
    { href: '/admin/certificate-template', label: t('certificateTemplate') },
    { href: '/admin/notification-templates', label: t('notificationTemplates') },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            pathname === tab.href || (tab.href !== '/admin' && pathname.startsWith(`${tab.href}/`))
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
