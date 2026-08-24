import type { AttemptInProgress, AttemptListItem, AttemptResult, AttemptState, StartAttemptInput, SubmitAttemptInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class TestAttemptService extends BaseService<AttemptState> {
  protected BASE_PATH = 'attempts';

  async start(input: StartAttemptInput) {
    return this.sendPost<AttemptInProgress, StartAttemptInput>('', input);
  }

  async submit(attemptId: string, input: SubmitAttemptInput) {
    return this.sendPost<AttemptResult, SubmitAttemptInput>(`/${attemptId}/submit`, input);
  }

  async myAttempts() {
    return this.sendGet<AttemptListItem[]>('');
  }
}

export const testAttemptService = new TestAttemptService();
