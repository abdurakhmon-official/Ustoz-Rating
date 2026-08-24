import { setRequestLocale } from 'next-intl/server';
import { AdminSubjectListView } from './AdminSubjectListView';

export default async function AdminSubjectsPage({ params }: PageProps<'/[locale]/admin/subjects'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminSubjectListView />;
}
