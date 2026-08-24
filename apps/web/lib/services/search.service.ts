import type { SearchOutput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class SearchService extends BaseService<never> {
  protected BASE_PATH = 'search';

  async search(q: string) {
    return this.sendGet<SearchOutput>('/', { q });
  }
}

export const searchService = new SearchService();
