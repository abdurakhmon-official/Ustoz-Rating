import { Controller, Inject } from '@tsed/di';
import { BodyParams, QueryParams } from '@tsed/platform-params';
import { Get, Patch } from '@tsed/schema';
import { UpdateRatingSettingsInputSchema } from '@/inputs/rating.input';
import type { UpdateRatingSettingsInput } from '@/inputs/rating.input';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { RatingService } from '@/services/rating.service';
import { RatingSettingsService } from '@/services/rating-settings.service';

@Controller('/ratings')
export class RatingController {
  @Inject()
  private ratingService!: RatingService;

  @Inject()
  private ratingSettingsService!: RatingSettingsService;

  @Get('/')
  async list(@QueryParams() query: Record<string, unknown>) {
    return this.ratingService.list(query);
  }

  @Get('/top')
  async top(@QueryParams() query: Record<string, unknown>) {
    return this.ratingService.top(query);
  }

  @Get('/me')
  @Authorized(Authenticate())
  async myRating() {
    return this.ratingService.myRating();
  }

  @Get('/settings')
  @Authorized(AdminOnly())
  async getSettings() {
    return { success: true, data: await this.ratingSettingsService.get() };
  }

  @Patch('/settings')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateSettings(@BodyParams() body: UpdateRatingSettingsInput) {
    const data = UpdateRatingSettingsInputSchema.parse(body);
    return { success: true, data: await this.ratingSettingsService.update(data) };
  }
}
