import { setRequestLocale } from 'next-intl/server';
import { NewUserForm } from './NewUserForm';

export default async function NewUserPage({ params }: PageProps<'/[locale]/admin/users/new'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewUserForm />;
}
