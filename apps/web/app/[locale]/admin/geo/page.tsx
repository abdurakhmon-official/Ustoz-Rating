import { setRequestLocale } from 'next-intl/server';
import { AdminGeoView } from './AdminGeoView';

export default async function AdminGeoPage({ params }: PageProps<'/[locale]/admin/geo'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminGeoView />;
}
