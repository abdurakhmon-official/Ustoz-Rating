import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Get, Post } from '@tsed/schema';
import { StartAttemptInputSchema, SubmitAttemptInputSchema } from '@/inputs/test-attempt.input';
import type { StartAttemptInput, SubmitAttemptInput } from '@/inputs/test-attempt.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { TestAttemptService } from '@/services/test-attempt.service';

@Controller('/attempts')
export class TestAttemptController {
  @Inject()
  private testAttemptService!: TestAttemptService;

  @Post('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.quizAttempt)
  async start(@BodyParams() body: StartAttemptInput) {
    return this.testAttemptService.startAttempt(StartAttemptInputSchema.parse(body));
  }

  @Post('/:attemptId/submit')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.quizAttempt)
  async submit(@PathParams('attemptId') attemptId: string, @BodyParams() body: SubmitAttemptInput) {
    return this.testAttemptService.submitAttempt(attemptId, SubmitAttemptInputSchema.parse(body));
  }

  @Get('/')
  @Authorized(Authenticate())
  async myAttempts() {
    return this.testAttemptService.myAttempts();
  }

  @Get('/:attemptId')
  @Authorized(Authenticate())
  async getAttempt(@PathParams('attemptId') attemptId: string) {
    return this.testAttemptService.getAttempt(attemptId);
  }
}
