import { setRequestLocale } from 'next-intl/server';
import { NewTestForm } from './NewTestForm';

export default async function NewTestPage({ params }: PageProps<'/[locale]/admin/tests/new'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewTestForm />;
}
