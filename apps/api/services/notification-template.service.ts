import { Inject, Injectable } from '@tsed/di';
import type { NotificationType, NotificationTemplateItem } from '@repo/contracts';
import prisma from '@/modules/db';
import { redis, isRedisReady } from '@/modules/redis';
import { AuditService } from '@/services/audit.service';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '@/utils/notification-templates.utils';
import { NOTIFICATION_TYPE } from '../generated/prisma';

@Injectable()
export class NotificationTemplateService {
  private static readonly CACHE_PREFIX = 'notification-template:';
  private static readonly TYPES = Object.values(NOTIFICATION_TYPE) as NotificationType[];

  @Inject()
  private auditService!: AuditService;

  async get(type: NotificationType): Promise<string> {
    const cached = await this.readCache(type);
    if (cached !== null) return cached;

    const row = await this.getOrCreateRow(type);
    await this.writeCache(type, row.text);

    return row.text;
  }

  async listAll(): Promise<NotificationTemplateItem[]> {
    return Promise.all(NotificationTemplateService.TYPES.map(async (type) => ({ type, text: await this.get(type) })));
  }

  async update(type: NotificationType, text: string): Promise<NotificationTemplateItem> {
    const row = await this.getOrCreateRow(type);

    const updated = await prisma.notificationTemplate.update({ where: { id: row.id }, data: { text } });
    await this.writeCache(type, updated.text);
    await this.auditService.log('UPDATE', 'NotificationTemplate', updated.id, { text: row.text }, { text: updated.text });

    return { type, text: updated.text };
  }

  private async getOrCreateRow(type: NotificationType) {
    const existing = await prisma.notificationTemplate.findUnique({ where: { type } });
    if (existing) return existing;

    return prisma.notificationTemplate.create({ data: { type, text: DEFAULT_NOTIFICATION_TEMPLATES[type] } });
  }

  private async readCache(type: NotificationType): Promise<string | null> {
    if (!isRedisReady()) return null;

    try {
      return await redis.get(NotificationTemplateService.CACHE_PREFIX + type);
    } catch {
      return null;
    }
  }

  private async writeCache(type: NotificationType, text: string): Promise<void> {
    if (!isRedisReady()) return;

    try {
      await redis.set(NotificationTemplateService.CACHE_PREFIX + type, text);
    } catch {
    }
  }
}
