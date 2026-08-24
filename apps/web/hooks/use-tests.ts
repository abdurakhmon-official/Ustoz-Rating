'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminTestQuery, CreateQuestionInput, CreateTestInput, UpdateTestInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { testService } from '@/lib/services';

export const useAdminTests = (query: Partial<AdminTestQuery>) => {
  return useQuery({
    queryKey: queryKeys.adminTests(query),
    queryFn: () => testService.list(query),
  });
};

export const useAdminTest = (testId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.adminTest(testId ?? ''),
    queryFn: () => testService.get(testId as string),
    enabled: Boolean(testId),
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTestInput) => testService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminTestsBase }),
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, input }: { testId: string; input: UpdateTestInput }) => testService.update(testId, input),
    onSuccess: (test) => {
      queryClient.setQueryData(queryKeys.adminTest(test.id), test);
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTestsBase });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => testService.delete(testId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminTestsBase }),
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, input }: { testId: string; input: CreateQuestionInput }) => testService.createQuestion(testId, input),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: queryKeys.adminTest(variables.testId) }),
  });
};

export const useImportQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, file }: { testId: string; file: File }) => testService.importQuestions(testId, file),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: queryKeys.adminTest(variables.testId) }),
  });
};
