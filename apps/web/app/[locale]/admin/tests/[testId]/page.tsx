import { setRequestLocale } from 'next-intl/server';
import { TestEditView } from './TestEditView';

export default async function TestEditPage({ params }: PageProps<'/[locale]/admin/tests/[testId]'>) {
  const { locale, testId } = await params;
  setRequestLocale(locale);

  return <TestEditView testId={testId} />;
}
