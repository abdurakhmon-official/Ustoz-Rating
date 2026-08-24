import { setRequestLocale } from 'next-intl/server';
import { CertificateTemplateView } from './CertificateTemplateView';

export default async function CertificateTemplatePage({ params }: PageProps<'/[locale]/admin/certificate-template'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CertificateTemplateView />;
}
