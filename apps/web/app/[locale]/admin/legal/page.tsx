import { setRequestLocale } from 'next-intl/server';
import { AdminLegalView } from './AdminLegalView';

export default async function AdminLegalPage({ params }: PageProps<'/[locale]/admin/legal'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminLegalView />;
}
