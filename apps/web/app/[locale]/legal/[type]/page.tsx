import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { LegalDocumentType } from '@repo/contracts';
import { LegalDocumentView } from './LegalDocumentView';

const TYPE_MAP: Record<string, LegalDocumentType> = {
  terms: 'TERMS',
  privacy: 'PRIVACY',
};

export default async function LegalDocumentPage({ params }: PageProps<'/[locale]/legal/[type]'>) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  const documentType = TYPE_MAP[type];
  if (!documentType) notFound();

  return <LegalDocumentView type={documentType} />;
}
