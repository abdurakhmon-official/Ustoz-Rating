import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Get, Patch, Post, Put } from '@tsed/schema';
import {
  AdminCreateUserInputSchema,
  AdminUpdateUserInputSchema,
  SetActiveInputSchema,
  UpdateProfileInputSchema,
  UpdateRoleInputSchema,
} from '@/inputs/user.input';
import type { AdminCreateUserInput, AdminUpdateUserInput, SetActiveInput, UpdateProfileInput, UpdateRoleInput } from '@/inputs/user.input';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { UserService } from '@/services/user.service';
import { TestAttemptService } from '@/services/test-attempt.service';

@Controller('/users')
export class UserController {
  @Inject()
  private userService!: UserService;

  @Inject()
  private testAttemptService!: TestAttemptService;

  @Patch('/me')
  @Authorized(Authenticate())
  async updateSelf(@BodyParams() body: UpdateProfileInput) {
    const data = UpdateProfileInputSchema.parse(body);
    return this.userService.updateSelf(data);
  }

  @Get('/')
  @Authorized(AdminOnly())
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.userService.list(query);
  }

  @Post('/')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async create(@BodyParams() body: AdminCreateUserInput) {
    return this.userService.adminCreate(AdminCreateUserInputSchema.parse(body));
  }

  @Get('/:id')
  @Authorized(AdminOnly())
  async get(@PathParams('id') id: string) {
    return this.userService.adminGet(id);
  }

  @Patch('/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async update(@PathParams('id') id: string, @BodyParams() body: AdminUpdateUserInput) {
    return this.userService.adminUpdate(id, AdminUpdateUserInputSchema.parse(body));
  }

  @Delete('/:id')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async delete(@PathParams('id') id: string) {
    return this.userService.softDelete(id);
  }

  @Get('/:id/attempts')
  @Authorized(AdminOnly())
  async attempts(@PathParams('id') id: string) {
    return this.testAttemptService.listForTeacher(id);
  }

  @Put('/:id/role')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateRole(@PathParams('id') id: string, @BodyParams() body: UpdateRoleInput) {
    const data = UpdateRoleInputSchema.parse(body);
    return this.userService.updateRole(id, data);
  }

  @Put('/:id/active')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async setActive(@PathParams('id') id: string, @BodyParams() body: SetActiveInput) {
    const data = SetActiveInputSchema.parse(body);
    return this.userService.setActive(id, data);
  }
}
