import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>{t('copyright', { year: new Date().getFullYear() })}</span>
        <div className="flex items-center gap-4">
          <Link href={{ pathname: '/legal/[type]', params: { type: 'terms' } }} className="hover:text-foreground">
            {t('terms')}
          </Link>
          <Link href={{ pathname: '/legal/[type]', params: { type: 'privacy' } }} className="hover:text-foreground">
            {t('privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
