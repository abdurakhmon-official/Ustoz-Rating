import type { NotificationListOutput, NotificationTemplateItem, NotificationType, UpdateNotificationTemplateInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class NotificationService extends BaseService<never> {
  protected BASE_PATH = 'notifications';

  async list() {
    return this.sendGet<NotificationListOutput>('/');
  }

  async markRead(id: string) {
    return this.sendPatch<{ id: string; read: boolean }, undefined>(`/${id}/read`, undefined);
  }

  async listTemplates() {
    return this.sendGet<NotificationTemplateItem[]>('/templates');
  }

  async updateTemplate(type: NotificationType, input: UpdateNotificationTemplateInput) {
    return this.sendPatch<NotificationTemplateItem, UpdateNotificationTemplateInput>(`/templates/${type}`, input);
  }
}

export const notificationService = new NotificationService();
