import { Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';

@Injectable()
export class AuditService {
  @InjectContext()
  private context!: PlatformContext;

  private get actorId(): string | undefined {
    return this.context?.getRequest<Request>()?.user?.id;
  }

  async log(action: string, entity: string, entityId: string, before?: unknown, after?: unknown): Promise<void> {
    const actorId = this.actorId;
    if (!actorId) return;

    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        before: before === undefined ? undefined : (before as object),
        after: after === undefined ? undefined : (after as object),
      },
    });
  }
}
