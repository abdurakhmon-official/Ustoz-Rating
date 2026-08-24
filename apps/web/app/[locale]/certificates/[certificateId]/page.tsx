import { setRequestLocale } from 'next-intl/server';
import { CertificateDetailView } from './CertificateDetailView';

export default async function CertificatePage({ params }: PageProps<'/[locale]/certificates/[certificateId]'>) {
  const { locale, certificateId } = await params;
  setRequestLocale(locale);

  return <CertificateDetailView certificateId={certificateId} />;
}
