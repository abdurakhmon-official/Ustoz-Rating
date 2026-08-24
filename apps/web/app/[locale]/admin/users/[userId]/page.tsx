import { setRequestLocale } from 'next-intl/server';
import { AdminUserDetailView } from './AdminUserDetailView';

export default async function AdminUserDetailPage({ params }: PageProps<'/[locale]/admin/users/[userId]'>) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return <AdminUserDetailView userId={userId} />;
}
