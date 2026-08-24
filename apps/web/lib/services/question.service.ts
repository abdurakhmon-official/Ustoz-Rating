import type { QuestionOutput, UpdateQuestionInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class QuestionService extends BaseService<QuestionOutput, never, UpdateQuestionInput> {
  protected BASE_PATH = 'questions';

  override async update(questionId: string, input: UpdateQuestionInput) {
    return this.sendPatch<QuestionOutput, UpdateQuestionInput>(`/${questionId}`, input);
  }
}

export const questionService = new QuestionService();
