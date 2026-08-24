import { Controller, Inject } from '@tsed/di';
import { Get } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { DashboardService } from '@/services/dashboard.service';

@Controller('/dashboard')
export class DashboardController {
  @Inject()
  private dashboardService!: DashboardService;

  @Get('/teacher')
  @Authorized(Authenticate())
  async teacher() {
    return this.dashboardService.teacherDashboard();
  }

  @Get('/admin')
  @Authorized(AdminOnly())
  async admin() {
    return this.dashboardService.adminDashboard();
  }
}
