import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Get, Patch } from '@tsed/schema';
import { UpdateCertificateTemplateInputSchema } from '@/inputs/certificate.input';
import type { UpdateCertificateTemplateInput } from '@/inputs/certificate.input';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { CertificateService } from '@/services/certificate.service';
import { CertificateTemplateService } from '@/services/certificate-template.service';

@Controller('/certificates')
export class CertificateController {
  @Inject()
  private certificateService!: CertificateService;

  @Inject()
  private certificateTemplateService!: CertificateTemplateService;

  @Get('/me')
  @Authorized(Authenticate())
  async myCertificates() {
    return this.certificateService.myCertificates();
  }

  @Get('/verify/:certificateId')
  @RateLimit(RATE_LIMITS.certificateVerify)
  async verify(@PathParams('certificateId') certificateId: string) {
    return this.certificateService.verify(certificateId);
  }

  @Get('/template')
  @Authorized(AdminOnly())
  async getTemplate() {
    return { success: true, data: await this.certificateTemplateService.get() };
  }

  @Patch('/template')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateTemplate(@BodyParams() body: UpdateCertificateTemplateInput) {
    const data = UpdateCertificateTemplateInputSchema.parse(body);
    return { success: true, data: await this.certificateTemplateService.update(data) };
  }
}
