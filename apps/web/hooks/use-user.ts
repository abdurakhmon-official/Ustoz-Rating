'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminCreateUserInput, AdminUpdateUserInput, AdminUserQuery, SetActiveInput, UpdateProfileInput, UpdateRoleInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { userService } from '@/lib/services';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => userService.updateProfile(input),
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  });
};

export const useAdminUsers = (query: Partial<AdminUserQuery>) => {
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: () => userService.list(query),
  });
};

export const useAdminUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.adminUser(userId ?? ''),
    queryFn: () => userService.get(userId as string),
    enabled: Boolean(userId),
  });
};

export const useAdminUserAttempts = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.adminUserAttempts(userId ?? ''),
    queryFn: () => userService.attempts(userId as string),
    enabled: Boolean(userId),
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminCreateUserInput) => userService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersBase }),
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AdminUpdateUserInput }) => userService.update(userId, input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.adminUser(user.id), user);
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersBase });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.delete(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersBase }),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateRoleInput }) => userService.updateRole(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersBase }),
  });
};

export const useSetUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: SetActiveInput }) => userService.setActive(userId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adminUsersBase }),
  });
};
