import { setRequestLocale } from 'next-intl/server';
import { TestListView } from './TestListView';

export default async function TestsPage({ params }: PageProps<'/[locale]/tests'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TestListView />;
}
