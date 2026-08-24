'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RatingQuery, UpdateRatingSettingsInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { ratingService } from '@/lib/services';

export const useRatings = (query: Partial<RatingQuery>) => {
  return useQuery({
    queryKey: queryKeys.ratings(query),
    queryFn: () => ratingService.list(query),
  });
};

export const useTopRating = (query: Partial<RatingQuery> = {}) => {
  return useQuery({
    queryKey: queryKeys.topRating(query),
    queryFn: () => ratingService.top(query),
  });
};

export const useMyRating = () => {
  return useQuery({
    queryKey: queryKeys.myRating,
    queryFn: () => ratingService.myRating(),
  });
};

export const useRatingSettings = () => {
  return useQuery({
    queryKey: queryKeys.ratingSettings,
    queryFn: () => ratingService.getSettings(),
  });
};

export const useUpdateRatingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRatingSettingsInput) => ratingService.updateSettings(input),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.ratingSettings, settings);
      queryClient.invalidateQueries({ queryKey: queryKeys.ratingsBase });
    },
  });
};
