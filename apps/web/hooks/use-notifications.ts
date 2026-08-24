'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationType, UpdateNotificationTemplateInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { notificationService } from '@/lib/services';
import { useSession } from '@/hooks/use-auth';

const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  const { isAuthenticated } = useSession();

  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationService.list(),
    enabled: isAuthenticated,
    refetchInterval: POLL_INTERVAL_MS,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: queryKeys.notificationTemplates,
    queryFn: () => notificationService.listTemplates(),
  });
};

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, input }: { type: NotificationType; input: UpdateNotificationTemplateInput }) =>
      notificationService.updateTemplate(type, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationTemplates });
    },
  });
};
