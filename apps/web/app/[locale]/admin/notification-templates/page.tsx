import { setRequestLocale } from 'next-intl/server';
import { NotificationTemplatesView } from './NotificationTemplatesView';

export default async function NotificationTemplatesPage({ params }: PageProps<'/[locale]/admin/notification-templates'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NotificationTemplatesView />;
}
