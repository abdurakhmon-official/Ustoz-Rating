import type { CertificateListItem, CertificateOutput, CertificateTemplateOutput, UpdateCertificateTemplateInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class CertificateService extends BaseService<never> {
  protected BASE_PATH = 'certificates';

  async myCertificates() {
    return this.sendGet<CertificateListItem[]>('/me');
  }

  async verify(certificateId: string) {
    return this.sendGet<CertificateOutput>(`/verify/${certificateId}`);
  }

  async getTemplate() {
    return this.sendGet<CertificateTemplateOutput>('/template');
  }

  async updateTemplate(input: UpdateCertificateTemplateInput) {
    return this.sendPatch<CertificateTemplateOutput, UpdateCertificateTemplateInput>('/template', input);
  }
}

export const certificateService = new CertificateService();
