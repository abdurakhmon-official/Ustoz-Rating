import { setRequestLocale } from 'next-intl/server';
import { TestInfoView } from './TestInfoView';

export default async function TestInfoPage({ params }: PageProps<'/[locale]/tests/[testId]'>) {
  const { locale, testId } = await params;
  setRequestLocale(locale);

  return <TestInfoView testId={testId} />;
}
