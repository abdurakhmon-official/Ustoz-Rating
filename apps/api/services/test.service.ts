import { Inject, Injectable } from '@tsed/di';
import { AdminTestQuerySchema } from '@repo/contracts';
import prisma from '@/modules/db';
import { badRequest, notFound } from '@/utils/errors.utils';
import { AuditService } from '@/services/audit.service';
import { NotificationService } from '@/services/notification.service';
import type { CreateTestInput, UpdateTestInput } from '@/inputs/test.input';
import { TEST_STATUS } from '../generated/prisma';

@Injectable()
export class TestService {
  private static readonly LIST_SELECT = {
    id: true,
    title: true,
    subjectId: true,
    durationMinutes: true,
    passingScore: true,
    status: true,
    createdAt: true,
    subject: { select: { name: true } },
    _count: { select: { questions: true } },
  };

  private static readonly DETAIL_SELECT = {
    id: true,
    title: true,
    subjectId: true,
    description: true,
    durationMinutes: true,
    passingScore: true,
    status: true,
    questions: {
      select: { id: true, testId: true, text: true, options: true, correctIndex: true, imageKey: true, order: true },
      orderBy: { order: 'asc' as const },
    },
  };

  @Inject()
  private auditService!: AuditService;

  @Inject()
  private notificationService!: NotificationService;

  async adminList(rawQuery: unknown) {
    const { subjectId, status, search, page, size } = AdminTestQuerySchema.parse(rawQuery);

    const where = {
      ...(subjectId ? { subjectId } : {}),
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        select: TestService.LIST_SELECT,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.test.count({ where }),
    ]);

    return {
      success: true,
      data: tests.map((test) => ({
        id: test.id,
        title: test.title,
        subjectId: test.subjectId,
        subjectName: test.subject.name,
        durationMinutes: test.durationMinutes,
        passingScore: test.passingScore,
        status: test.status,
        questionCount: test._count.questions,
        createdAt: test.createdAt.toISOString(),
      })),
      meta: { page, limit: size, total },
    };
  }

  async adminGet(testId: string) {
    const test = await prisma.test.findUnique({ where: { id: testId }, select: TestService.DETAIL_SELECT });
    if (!test) throw notFound('TEST_NOT_FOUND', 'test not found');

    return { success: true, data: test };
  }

  async create(input: CreateTestInput) {
    await this.assertSubjectExists(input.subjectId);

    const test = await prisma.test.create({ data: input, select: TestService.DETAIL_SELECT });
    await this.auditService.log('CREATE', 'Test', test.id, undefined, test);

    return { success: true, data: test };
  }

  async update(testId: string, input: UpdateTestInput) {
    const before = await prisma.test.findUnique({ where: { id: testId }, select: TestService.DETAIL_SELECT });
    if (!before) throw notFound('TEST_NOT_FOUND', 'test not found');

    if (input.subjectId) await this.assertSubjectExists(input.subjectId);

    if (input.status === TEST_STATUS.PUBLISHED && before.questions.length === 0) {
      throw badRequest('TEST_HAS_NO_QUESTIONS', 'a test with no questions cannot be published');
    }

    const test = await prisma.test.update({ where: { id: testId }, data: input, select: TestService.DETAIL_SELECT });
    await this.auditService.log('UPDATE', 'Test', testId, before, test);

    if (before.status !== TEST_STATUS.PUBLISHED && test.status === TEST_STATUS.PUBLISHED) {
      await this.notifySubjectSubscribers(test.subjectId, test.title);
    }

    return { success: true, data: test };
  }

  private async notifySubjectSubscribers(subjectId: string, title: string): Promise<void> {
    const [subject, teachers] = await Promise.all([
      prisma.subject.findUnique({ where: { id: subjectId }, select: { name: true } }),
      prisma.user.findMany({ where: { subjectId, active: true, deletedAt: null }, select: { id: true } }),
    ]);

    if (!subject || teachers.length === 0) return;

    await this.notificationService.notifyMany(
      teachers.map((teacher) => teacher.id),
      'TEST_PUBLISHED',
      { subject: subject.name, title },
    );
  }

  async delete(testId: string) {
    const before = await prisma.test.findUnique({ where: { id: testId } });
    if (!before) throw notFound('TEST_NOT_FOUND', 'test not found');

    await prisma.test.delete({ where: { id: testId } });
    await this.auditService.log('DELETE', 'Test', testId, before, undefined);

    return { success: true, data: null };
  }

  async assertOwnedTest(testId: string): Promise<void> {
    const test = await prisma.test.findUnique({ where: { id: testId }, select: { id: true } });
    if (!test) throw notFound('TEST_NOT_FOUND', 'test not found');
  }

  private async assertSubjectExists(subjectId: string): Promise<void> {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } });
    if (!subject) throw notFound('SUBJECT_NOT_FOUND', 'subject not found');
  }
}
