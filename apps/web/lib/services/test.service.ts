import type {
  AdminTestDetail,
  AdminTestListItem,
  AdminTestQuery,
  CreateQuestionInput,
  CreateTestInput,
  ImportQuestionsResult,
  QuestionOutput,
  UpdateTestInput,
} from '@repo/contracts';
import type { ApiResponse } from '@repo/contracts';
import api from '@/lib/axios';
import { BaseService, type Paged } from '@/lib/services/base.service';

export class TestService extends BaseService<AdminTestDetail, CreateTestInput, UpdateTestInput> {
  protected BASE_PATH = 'tests';

  async list(query: Partial<AdminTestQuery> = {}): Promise<Paged<AdminTestListItem>> {
    return this.sendGetPaged<AdminTestListItem>('', query);
  }

  override async update(testId: string, input: UpdateTestInput) {
    return this.sendPatch<AdminTestDetail, UpdateTestInput>(`/${testId}`, input);
  }

  async createQuestion(testId: string, input: CreateQuestionInput) {
    return this.sendPost<QuestionOutput, CreateQuestionInput>(`/${testId}/questions`, input);
  }

  async importQuestions(testId: string, file: File): Promise<ImportQuestionsResult> {
    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post<ApiResponse<ImportQuestionsResult>>(`/${this.BASE_PATH}/${testId}/questions/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data;
  }
}

export const testService = new TestService();
