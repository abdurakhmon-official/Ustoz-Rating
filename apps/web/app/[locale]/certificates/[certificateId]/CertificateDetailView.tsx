'use client';

import { CheckCircle2, Printer, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useVerifyCertificate } from '@/hooks/use-certificates';

export function CertificateDetailView({ certificateId }: { certificateId: string }) {
  const t = useTranslations('certificateDetail');
  const { data: certificate, isLoading, isError } = useVerifyCertificate(certificateId);

  if (isLoading) return null;

  if (isError || !certificate) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
        <XCircle className="size-16 text-destructive" />
        <h1 className="text-xl font-semibold">{t('notFound')}</h1>
        <p className="text-muted-foreground">{t('notFoundHint')}</p>
      </div>
    );
  }

  const verifyUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <Badge variant="success" className="gap-1.5 py-1 text-sm">
          <CheckCircle2 className="size-4" />
          {t('verified')}
        </Badge>
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="size-4" />
          {t('print')}
        </Button>
      </div>

      <Card className="border-2 border-primary/20">
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ustoz Rating</p>

          <p className="max-w-lg text-lg leading-relaxed text-balance">{certificate.renderedText}</p>

          <div className="grid w-full max-w-sm grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs text-muted-foreground">{t('teacher')}</p>
              <p className="font-medium">{certificate.teacherName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('subject')}</p>
              <p className="font-medium">{certificate.subjectName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('score')}</p>
              <p className="font-medium">{certificate.score}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('issuedAt')}</p>
              <p className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {verifyUrl && <QRCodeSVG value={verifyUrl} size={112} />}
            <p className="font-mono text-xs text-muted-foreground">
              {t('code')}: {certificate.certificateId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
