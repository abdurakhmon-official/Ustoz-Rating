import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { notFound, requireUserId } from '@/utils/errors.utils';
import { generateCertificateId, renderCertificateTemplate } from '@/utils/certificate.utils';
import { CertificateTemplateService } from '@/services/certificate-template.service';
import { NotificationService } from '@/services/notification.service';
import type { CertificateListItem, CertificateOutput } from '@repo/contracts';

interface IssueInput {
  attemptId: string;
  teacherId: string;
  testId: string;
  teacherName: string;
  subjectName: string;
  score: number;
}

@Injectable()
export class CertificateService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private certificateTemplateService!: CertificateTemplateService;

  @Inject()
  private notificationService!: NotificationService;

  private get teacherId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  /** attemptId'ga unique constraint borligi sababli idempotent — takror chaqirilsa ham faqat bitta sertifikat va bitta bildirishnoma yaratiladi. */
  async checkAndIssue(input: IssueInput): Promise<void> {
    const existing = await prisma.certificate.findUnique({ where: { attemptId: input.attemptId }, select: { id: true } });
    if (existing) return;

    try {
      await prisma.certificate.create({
        data: {
          certificateId: generateCertificateId(),
          attemptId: input.attemptId,
          teacherId: input.teacherId,
          testId: input.testId,
          teacherName: input.teacherName,
          subjectName: input.subjectName,
          score: input.score,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') return;
      throw error;
    }

    await this.notificationService.notify(input.teacherId, 'CERTIFICATE_ISSUED', {
      subject: input.subjectName,
      score: input.score,
    });
  }

  async myCertificates() {
    const certificates = await prisma.certificate.findMany({
      where: { teacherId: this.teacherId },
      select: { certificateId: true, subjectName: true, score: true, issuedAt: true },
      orderBy: { issuedAt: 'desc' },
    });

    const data: CertificateListItem[] = certificates.map((certificate) => ({
      ...certificate,
      issuedAt: certificate.issuedAt.toISOString(),
    }));

    return { success: true, data };
  }

  async verify(certificateId: string) {
    const certificate = await prisma.certificate.findUnique({ where: { certificateId } });
    if (!certificate) throw notFound('CERTIFICATE_NOT_FOUND', 'certificate not found');

    const template = await this.certificateTemplateService.get();

    const data: CertificateOutput = {
      certificateId: certificate.certificateId,
      teacherName: certificate.teacherName,
      subjectName: certificate.subjectName,
      score: certificate.score,
      issuedAt: certificate.issuedAt.toISOString(),
      renderedText: renderCertificateTemplate(template.text, {
        fullName: certificate.teacherName,
        subject: certificate.subjectName,
        score: certificate.score,
      }),
    };

    return { success: true, data };
  }
}
