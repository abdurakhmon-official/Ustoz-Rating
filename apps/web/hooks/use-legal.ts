'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateLegalDocumentInput, LegalDocumentType } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { legalService } from '@/lib/services';

export const useLegalDocument = (type: LegalDocumentType) => {
  return useQuery({
    queryKey: queryKeys.legalDocument(type),
    queryFn: () => legalService.current(type),
  });
};

export const useLegalHistory = (type: LegalDocumentType) => {
  return useQuery({
    queryKey: queryKeys.legalHistory(type),
    queryFn: () => legalService.history(type),
  });
};

export const usePublishLegalDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, input }: { type: LegalDocumentType; input: CreateLegalDocumentInput }) => legalService.publish(type, input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legalDocument(variables.type) });
      queryClient.invalidateQueries({ queryKey: queryKeys.legalHistory(variables.type) });
    },
  });
};
