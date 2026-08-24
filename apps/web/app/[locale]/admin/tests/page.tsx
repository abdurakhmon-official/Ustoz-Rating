import { setRequestLocale } from 'next-intl/server';
import { AdminTestListView } from './AdminTestListView';

export default async function AdminTestsPage({ params }: PageProps<'/[locale]/admin/tests'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminTestListView />;
}
