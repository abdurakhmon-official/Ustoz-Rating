import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { MulterOptions, MultipartFile, type PlatformMulterFile } from '@tsed/platform-multer';
import { Delete, Get, Patch, Post } from '@tsed/schema';
import { CreateTestInputSchema, UpdateTestInputSchema } from '@/inputs/test.input';
import type { CreateTestInput, UpdateTestInput } from '@/inputs/test.input';
import { CreateQuestionInputSchema } from '@/inputs/question.input';
import type { CreateQuestionInput } from '@/inputs/question.input';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { TestService } from '@/services/test.service';
import { QuestionService } from '@/services/question.service';
import { QuestionImportService } from '@/services/question-import.service';

@Controller('/tests')
export class TestController {
  private static readonly MAX_IMPORT_BYTES = 5 * 1024 * 1024;

  @Inject()
  private testService!: TestService;

  @Inject()
  private questionService!: QuestionService;

  @Inject()
  private questionImportService!: QuestionImportService;

  @Get('/')
  @Authorized(AdminOnly())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.testService.adminList(query);
  }

  @Get('/:testId')
  @Authorized(AdminOnly())
  async get(@PathParams('testId') testId: string) {
    return this.testService.adminGet(testId);
  }

  @Post('/')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async create(@BodyParams() body: CreateTestInput) {
    return this.testService.create(CreateTestInputSchema.parse(body));
  }

  @Patch('/:testId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async update(@PathParams('testId') testId: string, @BodyParams() body: UpdateTestInput) {
    return this.testService.update(testId, UpdateTestInputSchema.parse(body));
  }

  @Delete('/:testId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async delete(@PathParams('testId') testId: string) {
    return this.testService.delete(testId);
  }

  @Post('/:testId/questions')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createQuestion(@PathParams('testId') testId: string, @BodyParams() body: CreateQuestionInput) {
    return this.questionService.create(testId, CreateQuestionInputSchema.parse(body));
  }

  @Post('/:testId/questions/import')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  @MulterOptions({ limits: { fileSize: TestController.MAX_IMPORT_BYTES, files: 1 } })
  async importQuestions(@PathParams('testId') testId: string, @MultipartFile('file') file?: PlatformMulterFile) {
    return this.questionImportService.importFromFile(testId, file?.buffer);
  }
}
