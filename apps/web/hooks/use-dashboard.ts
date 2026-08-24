'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { dashboardService } from '@/lib/services';

export const useTeacherDashboard = () => {
  return useQuery({
    queryKey: queryKeys.teacherDashboard,
    queryFn: () => dashboardService.teacher(),
  });
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => dashboardService.admin(),
  });
};
