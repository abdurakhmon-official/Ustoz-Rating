import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Get, Patch } from '@tsed/schema';
import { NotificationTypeSchema } from '@repo/contracts';
import { UpdateNotificationTemplateInputSchema } from '@/inputs/notification.input';
import type { UpdateNotificationTemplateInput } from '@/inputs/notification.input';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { NotificationService } from '@/services/notification.service';
import { NotificationTemplateService } from '@/services/notification-template.service';

@Controller('/notifications')
export class NotificationController {
  @Inject()
  private notificationService!: NotificationService;

  @Inject()
  private notificationTemplateService!: NotificationTemplateService;

  @Get('/')
  @Authorized(Authenticate())
  async list() {
    return this.notificationService.list();
  }

  @Patch('/:id/read')
  @Authorized(Authenticate())
  async markRead(@PathParams('id') id: string) {
    return this.notificationService.markRead(id);
  }

  @Get('/templates')
  @Authorized(AdminOnly())
  async listTemplates() {
    return { success: true, data: await this.notificationTemplateService.listAll() };
  }

  @Patch('/templates/:type')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateTemplate(@PathParams('type') type: string, @BodyParams() body: UpdateNotificationTemplateInput) {
    const notificationType = NotificationTypeSchema.parse(type);
    const { text } = UpdateNotificationTemplateInputSchema.parse(body);

    return { success: true, data: await this.notificationTemplateService.update(notificationType, text) };
  }
}
