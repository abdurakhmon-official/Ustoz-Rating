import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import { subDays } from 'date-fns';
import { RatingQuerySchema } from '@repo/contracts';
import type { RatingPeriod, RatingQuery } from '@repo/contracts';
import prisma from '@/modules/db';
import { requireUserId } from '@/utils/errors.utils';
import { computeTeacherRating } from '@/utils/rating.utils';
import { RatingSettingsService } from '@/services/rating-settings.service';

interface ScopeFilters {
  regionId?: string;
  districtId?: string;
  schoolId?: string;
  subjectId?: string;
  gender?: 'MALE' | 'FEMALE';
  experienceMin?: number;
  period?: RatingPeriod;
}

interface RankedTeacher {
  teacherId: string;
  fullName: string;
  avatar: string | null;
  schoolName: string | null;
  regionName: string | null;
  subjectName: string | null;
  avgScore: number;
  bestScore: number;
  attemptCount: number;
  compositeScore: number;
}

@Injectable()
export class RatingService {
  private static readonly TOP_LIMIT = 10;

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private ratingSettingsService!: RatingSettingsService;

  private get teacherId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async list(rawQuery: unknown) {
    const query = this.parseQuery(rawQuery);
    const ranked = await this.computeRankings(query);

    const start = (query.page - 1) * query.size;
    const page = ranked.slice(start, start + query.size).map((teacher, index) => ({ rank: start + index + 1, ...teacher }));

    return {
      success: true,
      data: page,
      meta: { page: query.page, limit: query.size, total: ranked.length },
    };
  }

  async top(rawQuery: unknown) {
    const query = this.parseQuery(rawQuery);
    const ranked = await this.computeRankings(query);

    return {
      success: true,
      data: ranked.slice(0, RatingService.TOP_LIMIT).map((teacher, index) => ({ rank: index + 1, ...teacher })),
    };
  }

  async myRating() {
    const teacher = await prisma.user.findUniqueOrThrow({
      where: { id: this.teacherId },
      select: { regionId: true, districtId: true },
    });

    const [republic, region, district] = await Promise.all([
      this.computeRankings({}),
      teacher.regionId ? this.computeRankings({ regionId: teacher.regionId }) : Promise.resolve([]),
      teacher.districtId ? this.computeRankings({ districtId: teacher.districtId }) : Promise.resolve([]),
    ]);

    const mine = republic.find((entry) => entry.teacherId === this.teacherId);

    return {
      success: true,
      data: {
        eligible: Boolean(mine),
        avgScore: mine?.avgScore ?? 0,
        bestScore: mine?.bestScore ?? 0,
        attemptCount: mine?.attemptCount ?? 0,
        republicRank: this.findRank(republic, this.teacherId),
        republicTotal: republic.length,
        regionRank: this.findRank(region, this.teacherId),
        regionTotal: region.length,
        districtRank: this.findRank(district, this.teacherId),
        districtTotal: district.length,
      },
    };
  }

  /** Respublika darajasidagi joriy o'rinlar — davriy reyting-o'zgarish bildirishnomasi uchun. */
  async republicRanks(): Promise<{ teacherId: string; rank: number }[]> {
    const ranked = await this.computeRankings({});
    return ranked.map((teacher, index) => ({ teacherId: teacher.teacherId, rank: index + 1 }));
  }

  private findRank(ranked: RankedTeacher[], teacherId: string): number | null {
    const index = ranked.findIndex((entry) => entry.teacherId === teacherId);
    return index === -1 ? null : index + 1;
  }

  private parseQuery(rawQuery: unknown): RatingQuery {
    return RatingQuerySchema.parse(rawQuery);
  }

  private async computeRankings(filters: ScopeFilters): Promise<RankedTeacher[]> {
    const settings = await this.ratingSettingsService.get();
    const periodStart = this.periodStartDate(filters.period);

    const attempts = await prisma.testAttempt.findMany({
      where: {
        submittedAt: { not: null, ...(periodStart ? { gte: periodStart } : {}) },
        score: { not: null },
        ...(filters.subjectId ? { test: { subjectId: filters.subjectId } } : {}),
        teacher: {
          active: true,
          deletedAt: null,
          ...(filters.regionId ? { regionId: filters.regionId } : {}),
          ...(filters.districtId ? { districtId: filters.districtId } : {}),
          ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
          ...(filters.gender ? { gender: filters.gender } : {}),
          ...(filters.experienceMin !== undefined ? { experienceYears: { gte: filters.experienceMin } } : {}),
        },
      },
      select: {
        teacherId: true,
        score: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            school: { select: { name: true } },
            region: { select: { name: true } },
            subject: { select: { name: true } },
          },
        },
      },
    });

    const byTeacher = new Map<string, { teacher: (typeof attempts)[number]['teacher']; scores: number[] }>();

    for (const attempt of attempts) {
      if (attempt.score === null) continue;

      const bucket = byTeacher.get(attempt.teacherId) ?? { teacher: attempt.teacher, scores: [] };
      bucket.scores.push(attempt.score);
      byTeacher.set(attempt.teacherId, bucket);
    }

    const ranked: RankedTeacher[] = [];

    for (const [teacherId, bucket] of byTeacher) {
      if (bucket.scores.length < settings.minAttemptsRequired) continue;

      const computed = computeTeacherRating({ scores: bucket.scores }, settings);

      ranked.push({
        teacherId,
        fullName: bucket.teacher.fullName,
        avatar: bucket.teacher.avatar,
        schoolName: bucket.teacher.school?.name ?? null,
        regionName: bucket.teacher.region?.name ?? null,
        subjectName: bucket.teacher.subject?.name ?? null,
        ...computed,
      });
    }

    return ranked.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  private periodStartDate(period?: RatingPeriod): Date | null {
    if (period === 'week') return subDays(new Date(), 7);
    if (period === 'month') return subDays(new Date(), 30);
    return null;
  }
}
