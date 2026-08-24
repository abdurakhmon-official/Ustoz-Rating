import { setRequestLocale } from 'next-intl/server';
import { AttemptListView } from './AttemptListView';

export default async function AttemptsPage({ params }: PageProps<'/[locale]/attempts'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AttemptListView />;
}
