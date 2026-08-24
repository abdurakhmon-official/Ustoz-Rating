import type { CreateLegalDocumentInput, LegalDocumentOutput, LegalDocumentType, LegalDocumentVersion } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class LegalService extends BaseService<never> {
  protected BASE_PATH = 'legal';

  async current(type: LegalDocumentType) {
    return this.sendGet<LegalDocumentOutput>(`/${type}`);
  }

  async history(type: LegalDocumentType) {
    return this.sendGet<LegalDocumentVersion[]>(`/${type}/history`);
  }

  async publish(type: LegalDocumentType, input: CreateLegalDocumentInput) {
    return this.sendPost<LegalDocumentOutput, CreateLegalDocumentInput>(`/${type}`, input);
  }
}

export const legalService = new LegalService();
