'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { VerifyEmailInputSchema, type VerifyEmailInput } from '@repo/contracts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { errorFrom } from '@/lib/errors';
import { useRouter } from '@/i18n/navigation';
import { useResendVerification, useSession, useVerifyEmail } from '@/hooks/use-auth';

export function VerifyEmailForm() {
  const t = useTranslations('auth.verifyEmail');
  const router = useRouter();
  const { user } = useSession();
  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();
  const [verified, setVerified] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailInput>({ resolver: zodResolver(VerifyEmailInputSchema) });

  if (user?.emailVerified || verified) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-lg font-medium text-foreground">{t('success')}</p>
          <Button onClick={() => router.push('/')}>{t('continue')}</Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await verifyEmail.mutateAsync(data);
      setVerified(true);
    } catch (error) {
      const detail = errorFrom(error);
      setError('root', { message: detail.message });
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField label={t('code')} htmlFor="code" error={errors.code?.message}>
            <Input id="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" {...register('code')} />
          </FormField>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" disabled={verifyEmail.isPending} className="mt-2">
            {verifyEmail.isPending ? t('loading') : t('submit')}
          </Button>

          <Button type="button" variant="ghost" disabled={resend.isPending} onClick={() => resend.mutate()}>
            {resend.isPending ? t('resendLoading') : t('resend')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
