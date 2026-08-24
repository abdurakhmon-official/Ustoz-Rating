import { Inject, Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { AuditService } from '@/services/audit.service';
import { DEFAULT_CERTIFICATE_TEMPLATE_TEXT } from '@/utils/certificate.utils';
import type { CertificateTemplateOutput, UpdateCertificateTemplateInput } from '@repo/contracts';

@Injectable()
export class CertificateTemplateService {
  @Inject()
  private auditService!: AuditService;

  async get(): Promise<CertificateTemplateOutput> {
    const row = await this.getOrCreateRow();
    return { text: row.text };
  }

  async update(input: UpdateCertificateTemplateInput): Promise<CertificateTemplateOutput> {
    const row = await this.getOrCreateRow();

    const updated = await prisma.certificateTemplate.update({
      where: { id: row.id },
      data: { text: input.text },
    });

    await this.auditService.log('UPDATE', 'CertificateTemplate', updated.id, { text: row.text }, { text: updated.text });

    return { text: updated.text };
  }

  private async getOrCreateRow() {
    const existing = await prisma.certificateTemplate.findFirst();
    if (existing) return existing;

    return prisma.certificateTemplate.create({ data: { text: DEFAULT_CERTIFICATE_TEMPLATE_TEXT } });
  }
}
