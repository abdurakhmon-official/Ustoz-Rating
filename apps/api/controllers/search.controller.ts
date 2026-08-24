import { Controller, Inject } from '@tsed/di';
import { QueryParams } from '@tsed/platform-params';
import { Get } from '@tsed/schema';
import { SearchQuerySchema } from '@/inputs/notification.input';
import { Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { SearchService } from '@/services/search.service';

@Controller('/search')
export class SearchController {
  @Inject()
  private searchService!: SearchService;

  @Get('/')
  @Authorized(Authenticate())
  @RateLimit(RATE_LIMITS.search)
  async search(@QueryParams() query: Record<string, unknown>) {
    const { q } = SearchQuerySchema.parse(query);
    return this.searchService.search(q);
  }
}
