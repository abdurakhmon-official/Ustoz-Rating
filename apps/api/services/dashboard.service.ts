import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import { startOfDay } from 'date-fns';
import type { AdminDashboardOutput, TeacherDashboardOutput } from '@repo/contracts';
import prisma from '@/modules/db';
import { requireUserId } from '@/utils/errors.utils';
import { averageScore, dailyTrend, groupAverageByLabel, trendRangeStart } from '@/utils/dashboard.utils';
import { RatingService } from '@/services/rating.service';
import { USER_ROLE } from '../generated/prisma';

@Injectable()
export class DashboardService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private ratingService!: RatingService;

  private get teacherId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async teacherDashboard() {
    const teacher = await prisma.user.findUniqueOrThrow({ where: { id: this.teacherId }, select: { subjectId: true } });

    const [myRating, certificateCount, recentAttempts, top] = await Promise.all([
      this.ratingService.myRating(),
      prisma.certificate.count({ where: { teacherId: this.teacherId } }),
      prisma.testAttempt.findMany({
        where: { teacherId: this.teacherId, submittedAt: { not: null } },
        orderBy: { submittedAt: 'desc' },
        take: 10,
        select: { id: true, score: true, submittedAt: true, test: { select: { title: true } } },
      }),
      teacher.subjectId ? this.ratingService.top({ subjectId: teacher.subjectId }) : Promise.resolve({ data: [] }),
    ]);

    const data: TeacherDashboardOutput = {
      republicRank: myRating.data.republicRank,
      republicTotal: myRating.data.republicTotal,
      regionRank: myRating.data.regionRank,
      regionTotal: myRating.data.regionTotal,
      avgScore: myRating.data.avgScore,
      bestScore: myRating.data.bestScore,
      attemptCount: myRating.data.attemptCount,
      certificateCount,
      recentAttempts: recentAttempts
        .reverse()
        .map((attempt) => ({
          id: attempt.id,
          testTitle: attempt.test.title,
          score: attempt.score ?? 0,
          submittedAt: attempt.submittedAt!.toISOString(),
        })),
      topTeachers: top.data,
    };

    return { success: true, data };
  }

  async adminDashboard() {
    const rangeStart = trendRangeStart();

    const [teacherCount, subjectCount, testCount, questionCount, todaySubmissions, scoredAttempts, teachers] = await Promise.all([
      prisma.user.count({ where: { role: USER_ROLE.TEACHER, deletedAt: null } }),
      prisma.subject.count({ where: { isActive: true } }),
      prisma.test.count(),
      prisma.question.count(),
      prisma.testAttempt.count({ where: { submittedAt: { gte: startOfDay(new Date()) } } }),
      prisma.testAttempt.findMany({
        where: { submittedAt: { not: null }, score: { not: null } },
        select: {
          score: true,
          submittedAt: true,
          test: { select: { subject: { select: { name: true } } } },
          teacher: { select: { region: { select: { name: true } } } },
        },
      }),
      prisma.user.findMany({
        where: { role: USER_ROLE.TEACHER, deletedAt: null, createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
    ]);

    const data: AdminDashboardOutput = {
      teacherCount,
      subjectCount,
      testCount,
      questionCount,
      todaySubmissions,
      avgScore: averageScore(scoredAttempts.map((attempt) => attempt.score)),
      scoresBySubject: groupAverageByLabel(
        scoredAttempts.map((attempt) => ({ label: attempt.test.subject.name, score: attempt.score! })),
      ),
      scoresByRegion: groupAverageByLabel(
        scoredAttempts.map((attempt) => ({ label: attempt.teacher.region?.name ?? null, score: attempt.score! })),
      ),
      submissionsPerDay: dailyTrend(
        scoredAttempts.filter((attempt) => attempt.submittedAt).map((attempt) => attempt.submittedAt!),
      ),
      teacherGrowth: dailyTrend(teachers.map((teacher) => teacher.createdAt)),
    };

    return { success: true, data };
  }
}
