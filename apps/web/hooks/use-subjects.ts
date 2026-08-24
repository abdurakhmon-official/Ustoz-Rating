'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSubjectInput, UpdateSubjectInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { subjectService } from '@/lib/services';

export const useSubjects = () => {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: () => subjectService.list(),
    staleTime: 60 * 60_000,
  });
};

export const useAdminSubjects = () => {
  return useQuery({
    queryKey: queryKeys.adminSubjects,
    queryFn: () => subjectService.adminList(),
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubjectInput) => subjectService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSubjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, input }: { subjectId: string; input: UpdateSubjectInput }) => subjectService.update(subjectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSubjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => subjectService.delete(subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminSubjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });
};
