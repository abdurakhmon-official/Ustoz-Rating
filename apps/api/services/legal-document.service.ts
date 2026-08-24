import { Inject, Injectable } from '@tsed/di';
import type { CreateLegalDocumentInput, LegalDocumentOutput, LegalDocumentType, LegalDocumentVersion } from '@repo/contracts';
import prisma from '@/modules/db';
import { AuditService } from '@/services/audit.service';
import { DEFAULT_LEGAL_DOCUMENT_TEXT } from '@/utils/legal-document.utils';

@Injectable()
export class LegalDocumentService {
  @Inject()
  private auditService!: AuditService;

  async getCurrent(type: LegalDocumentType): Promise<LegalDocumentOutput> {
    const doc = await this.getOrCreateCurrent(type);
    return { type, text: doc.text, effectiveFrom: doc.effectiveFrom.toISOString() };
  }

  async history(type: LegalDocumentType): Promise<LegalDocumentVersion[]> {
    const docs = await prisma.legalDocument.findMany({ where: { type }, orderBy: { effectiveFrom: 'desc' } });

    return docs.map((doc) => ({
      id: doc.id,
      text: doc.text,
      effectiveFrom: doc.effectiveFrom.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    }));
  }

  /** Yangi versiya har doim YANGI qator sifatida yaratiladi — eski versiyalar o'zgartirilmaydi. */
  async publish(type: LegalDocumentType, input: CreateLegalDocumentInput): Promise<LegalDocumentOutput> {
    const doc = await prisma.legalDocument.create({
      data: { type, text: input.text, effectiveFrom: input.effectiveFrom ?? new Date() },
    });

    await this.auditService.log('CREATE', 'LegalDocument', doc.id, undefined, {
      type,
      text: doc.text,
      effectiveFrom: doc.effectiveFrom,
    });

    return { type, text: doc.text, effectiveFrom: doc.effectiveFrom.toISOString() };
  }

  private async getOrCreateCurrent(type: LegalDocumentType) {
    const current = await prisma.legalDocument.findFirst({
      where: { type, effectiveFrom: { lte: new Date() } },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (current) return current;

    return prisma.legalDocument.create({
      data: { type, text: DEFAULT_LEGAL_DOCUMENT_TEXT[type], effectiveFrom: new Date() },
    });
  }
}
