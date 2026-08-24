import type { MyRatingOutput, RatingListItem, RatingQuery, RatingSettingsOutput, UpdateRatingSettingsInput } from '@repo/contracts';
import { BaseService, type Paged } from '@/lib/services/base.service';

export class RatingService extends BaseService<never> {
  protected BASE_PATH = 'ratings';

  async list(query: Partial<RatingQuery> = {}): Promise<Paged<RatingListItem>> {
    return this.sendGetPaged<RatingListItem>('', query);
  }

  async top(query: Partial<RatingQuery> = {}) {
    return this.sendGet<RatingListItem[]>('/top', query);
  }

  async myRating() {
    return this.sendGet<MyRatingOutput>('/me');
  }

  async getSettings() {
    return this.sendGet<RatingSettingsOutput>('/settings');
  }

  async updateSettings(input: UpdateRatingSettingsInput) {
    return this.sendPatch<RatingSettingsOutput, UpdateRatingSettingsInput>('/settings', input);
  }
}

export const ratingService = new RatingService();
