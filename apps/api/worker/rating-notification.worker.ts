import { Inject, Injectable } from '@tsed/di';
import { $log } from '@tsed/common';
import { redis, isRedisReady } from '@/modules/redis';
import { RatingService } from '@/services/rating.service';
import { NotificationService } from '@/services/notification.service';

@Injectable()
export class RatingNotificationWorker {
  private static readonly SNAPSHOT_KEY = 'rating:prev-ranks';
  private static readonly SCAN_INTERVAL_MS = 60 * 60 * 1000;

  private timer?: NodeJS.Timeout;

  @Inject()
  private ratingService!: RatingService;

  @Inject()
  private notificationService!: NotificationService;

  $onInit() {
    this.timer = setInterval(() => void this.scan(), RatingNotificationWorker.SCAN_INTERVAL_MS);
    this.timer.unref();
  }

  $onDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async scan(): Promise<void> {
    if (!isRedisReady()) return;

    try {
      const current = await this.ratingService.republicRanks();
      const previous = await this.readSnapshot();

      if (previous) {
        for (const entry of current) {
          const prevRank = previous[entry.teacherId];
          if (prevRank === undefined) continue;

          const delta = prevRank - entry.rank;
          if (delta > 0) {
            await this.notificationService.notify(entry.teacherId, 'RATING_CHANGED', { delta });
          }
        }
      }

      await this.writeSnapshot(current);
    } catch (error) {
      $log.error({ event: 'RATING_NOTIFICATION_SCAN_FAILED', message: (error as Error).message });
    }
  }

  private async readSnapshot(): Promise<Record<string, number> | null> {
    const raw = await redis.get(RatingNotificationWorker.SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : null;
  }

  private async writeSnapshot(ranks: { teacherId: string; rank: number }[]): Promise<void> {
    const map: Record<string, number> = {};
    for (const entry of ranks) map[entry.teacherId] = entry.rank;

    await redis.set(RatingNotificationWorker.SNAPSHOT_KEY, JSON.stringify(map));
  }
}
