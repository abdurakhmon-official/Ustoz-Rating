'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SubmitAttemptInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { testAttemptService, testService } from '@/lib/services';

export const usePublishedTests = (subjectId?: string) => {
  return useQuery({
    queryKey: queryKeys.publishedTests(subjectId),
    queryFn: () => testService.listPublished(subjectId),
  });
};

export const useStartAttempt = () => {
  return useMutation({
    mutationFn: (testId: string) => testAttemptService.start({ testId }),
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, input }: { attemptId: string; input: SubmitAttemptInput }) => testAttemptService.submit(attemptId, input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myAttemptsBase });
      queryClient.invalidateQueries({ queryKey: queryKeys.attempt(variables.attemptId) });
    },
  });
};

export const useMyAttempts = () => {
  return useQuery({
    queryKey: queryKeys.myAttemptsBase,
    queryFn: () => testAttemptService.myAttempts(),
  });
};

export const useAttempt = (attemptId: string) => {
  return useQuery({
    queryKey: queryKeys.attempt(attemptId),
    queryFn: () => testAttemptService.get(attemptId),
  });
};
