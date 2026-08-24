'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateCertificateTemplateInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { certificateService } from '@/lib/services';

export const useMyCertificates = () => {
  return useQuery({
    queryKey: queryKeys.myCertificates,
    queryFn: () => certificateService.myCertificates(),
  });
};

export const useVerifyCertificate = (certificateId: string) => {
  return useQuery({
    queryKey: queryKeys.certificate(certificateId),
    queryFn: () => certificateService.verify(certificateId),
    enabled: !!certificateId,
    retry: false,
  });
};

export const useCertificateTemplate = () => {
  return useQuery({
    queryKey: queryKeys.certificateTemplate,
    queryFn: () => certificateService.getTemplate(),
  });
};

export const useUpdateCertificateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCertificateTemplateInput) => certificateService.updateTemplate(input),
    onSuccess: (template) => {
      queryClient.setQueryData(queryKeys.certificateTemplate, template);
    },
  });
};
