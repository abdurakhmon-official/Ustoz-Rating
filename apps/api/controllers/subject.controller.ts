import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Delete, Get, Patch, Post } from '@tsed/schema';
import { CreateSubjectInputSchema, UpdateSubjectInputSchema } from '@/inputs/subject.input';
import type { CreateSubjectInput, UpdateSubjectInput } from '@/inputs/subject.input';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { SubjectService } from '@/services/subject.service';

@Controller('/subjects')
export class SubjectController {
  @Inject()
  private subjectService!: SubjectService;

  @Get('/')
  async list() {
    return this.subjectService.list();
  }

  @Get('/admin')
  @Authorized(AdminOnly())
  async adminList() {
    return this.subjectService.adminList();
  }

  @Post('/')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async create(@BodyParams() body: CreateSubjectInput) {
    return this.subjectService.create(CreateSubjectInputSchema.parse(body));
  }

  @Patch('/:subjectId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async update(@PathParams('subjectId') subjectId: string, @BodyParams() body: UpdateSubjectInput) {
    return this.subjectService.update(subjectId, UpdateSubjectInputSchema.parse(body));
  }

  @Delete('/:subjectId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async delete(@PathParams('subjectId') subjectId: string) {
    return this.subjectService.delete(subjectId);
  }
}
