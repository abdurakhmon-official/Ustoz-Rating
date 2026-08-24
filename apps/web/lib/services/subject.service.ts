import type { CreateSubjectInput, SubjectOutput, UpdateSubjectInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class SubjectService extends BaseService<SubjectOutput, CreateSubjectInput, UpdateSubjectInput> {
  protected BASE_PATH = 'subjects';

  async list() {
    return this.sendGet<SubjectOutput[]>('');
  }

  async adminList() {
    return this.sendGet<SubjectOutput[]>('/admin');
  }

  override async update(subjectId: string, input: UpdateSubjectInput) {
    return this.sendPatch<SubjectOutput>(`/${subjectId}`, input);
  }
}

export const subjectService = new SubjectService();
