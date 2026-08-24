import type { AdminDashboardOutput, TeacherDashboardOutput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class DashboardService extends BaseService<never> {
  protected BASE_PATH = 'dashboard';

  async teacher() {
    return this.sendGet<TeacherDashboardOutput>('/teacher');
  }

  async admin() {
    return this.sendGet<AdminDashboardOutput>('/admin');
  }
}

export const dashboardService = new DashboardService();
