import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { CreateLegalDocumentInputSchema, LegalDocumentTypeSchema } from '@/inputs/legal.input';
import type { CreateLegalDocumentInput } from '@/inputs/legal.input';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { LegalDocumentService } from '@/services/legal-document.service';

@Controller('/legal')
export class LegalController {
  @Inject()
  private legalDocumentService!: LegalDocumentService;

  @Get('/:type')
  async current(@PathParams('type') type: string) {
    const docType = LegalDocumentTypeSchema.parse(type);
    return { success: true, data: await this.legalDocumentService.getCurrent(docType) };
  }

  @Get('/:type/history')
  @Authorized(AdminOnly())
  async history(@PathParams('type') type: string) {
    const docType = LegalDocumentTypeSchema.parse(type);
    return { success: true, data: await this.legalDocumentService.history(docType) };
  }

  @Post('/:type')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async publish(@PathParams('type') type: string, @BodyParams() body: CreateLegalDocumentInput) {
    const docType = LegalDocumentTypeSchema.parse(type);
    const data = CreateLegalDocumentInputSchema.parse(body);
    return { success: true, data: await this.legalDocumentService.publish(docType, data) };
  }
}
