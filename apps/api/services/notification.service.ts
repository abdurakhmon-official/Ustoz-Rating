import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import type { NotificationListOutput, NotificationType } from '@repo/contracts';
import prisma from '@/modules/db';
import { forbidden, notFound, requireUserId } from '@/utils/errors.utils';
import { renderTemplate } from '@/utils/template.utils';
import { NotificationTemplateService } from '@/services/notification-template.service';

@Injectable()
export class NotificationService {
  private static readonly LIST_LIMIT = 30;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private notificationTemplateService!: NotificationTemplateService;

  private get userId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async list() {
    const userId = this.userId;

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: NotificationService.LIST_LIMIT,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    const data: NotificationListOutput = {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        text: item.text,
        read: item.read,
        createdAt: item.createdAt.toISOString(),
      })),
      unreadCount,
    };

    return { success: true, data };
  }

  async markRead(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw notFound('NOTIFICATION_NOT_FOUND', 'notification not found');
    if (notification.userId !== this.userId) throw forbidden('NOTIFICATION_FORBIDDEN', 'this notification does not belong to you');

    const updated = await prisma.notification.update({ where: { id }, data: { read: true } });

    return { success: true, data: { id: updated.id, read: updated.read } };
  }

  async notify(userId: string, type: NotificationType, values: Record<string, string | number>): Promise<void> {
    const template = await this.notificationTemplateService.get(type);

    await prisma.notification.create({
      data: { userId, type, text: renderTemplate(template, values) },
    });
  }

  async notifyMany(userIds: string[], type: NotificationType, values: Record<string, string | number>): Promise<void> {
    if (userIds.length === 0) return;

    const template = await this.notificationTemplateService.get(type);
    const text = renderTemplate(template, values);

    await prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type, text })),
    });
  }
}
