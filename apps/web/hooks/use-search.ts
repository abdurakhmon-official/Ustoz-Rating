'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { searchService } from '@/lib/services';

export const useSearch = (q: string) => {
  return useQuery({
    queryKey: queryKeys.search(q),
    queryFn: () => searchService.search(q),
    enabled: q.trim().length > 1,
  });
};
