import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import { differenceInSeconds } from 'date-fns';
import prisma from '@/modules/db';
import { badRequest, forbidden, notFound, requireUserId } from '@/utils/errors.utils';
import { gradeAttempt } from '@/utils/scoring.utils';
import { TEST_STATUS, Prisma } from '../generated/prisma';
import type { StartAttemptInput, SubmitAttemptInput } from '@/inputs/test-attempt.input';

@Injectable()
export class TestAttemptService {
  private static readonly SUBMIT_GRACE_SECONDS = 30;

  @InjectContext()
  private context!: PlatformContext;

  private get user() {
    return this.context.getRequest<Request>().user;
  }

  private get teacherId(): string {
    return requireUserId(this.user);
  }

  async listPublished(subjectId?: string) {
    const tests = await prisma.test.findMany({
      where: { status: TEST_STATUS.PUBLISHED, ...(subjectId ? { subjectId } : {}) },
      select: {
        id: true,
        title: true,
        subjectId: true,
        description: true,
        durationMinutes: true,
        passingScore: true,
        subject: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: tests.map((test) => ({
        id: test.id,
        title: test.title,
        subjectId: test.subjectId,
        subjectName: test.subject.name,
        description: test.description,
        durationMinutes: test.durationMinutes,
        passingScore: test.passingScore,
        questionCount: test._count.questions,
      })),
    };
  }

  async startAttempt(input: StartAttemptInput) {
    if (!this.user?.emailVerified) {
      throw forbidden('AUTH_EMAIL_NOT_VERIFIED', 'verify your email before taking a test');
    }

    const test = await prisma.test.findUnique({
      where: { id: input.testId },
      select: {
        id: true,
        title: true,
        durationMinutes: true,
        passingScore: true,
        status: true,
        questions: {
          select: { id: true, text: true, options: true, imageKey: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test || test.status !== TEST_STATUS.PUBLISHED) throw notFound('TEST_NOT_FOUND', 'test not found');
    if (test.questions.length === 0) throw badRequest('TEST_HAS_NO_QUESTIONS', 'a test with no questions cannot be taken');

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: test.id,
        teacherId: this.teacherId,
        passingScore: test.passingScore,
        questionCount: test.questions.length,
      },
    });

    return {
      success: true,
      data: {
        status: 'IN_PROGRESS' as const,
        id: attempt.id,
        testId: test.id,
        testTitle: test.title,
        durationMinutes: test.durationMinutes,
        startedAt: attempt.startedAt.toISOString(),
        questions: test.questions,
      },
    };
  }

  async submitAttempt(attemptId: string, input: SubmitAttemptInput) {
    const attempt = await this.findOwnedInProgressAttempt(attemptId);

    const test = await prisma.test.findUniqueOrThrow({
      where: { id: attempt.testId },
      select: {
        id: true,
        title: true,
        durationMinutes: true,
        questions: { select: { id: true, correctIndex: true } },
      },
    });

    const elapsedSeconds = differenceInSeconds(new Date(), attempt.startedAt);
    const allowedSeconds = test.durationMinutes * 60;
    if (elapsedSeconds > allowedSeconds + TestAttemptService.SUBMIT_GRACE_SECONDS) {
      throw badRequest('ATTEMPT_TIME_EXPIRED', 'the time allowed for this attempt has expired');
    }

    const validAnswers = this.pickValidAnswers(test.questions, input.answers);
    const result = gradeAttempt(test.questions, validAnswers, attempt.passingScore);

    const updated = await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: validAnswers as unknown as Prisma.InputJsonValue,
        score: result.score,
        correctCount: result.correctCount,
        passed: result.passed,
        timeSpentSeconds: Math.min(elapsedSeconds, allowedSeconds),
        submittedAt: new Date(),
      },
    });

    return {
      success: true,
      _code: 'ATTEMPT_SUBMITTED',
      _message: 'Attempt submitted',
      data: {
        id: updated.id,
        testId: test.id,
        testTitle: test.title,
        score: result.score,
        correctCount: result.correctCount,
        questionCount: result.questionCount,
        passed: result.passed,
        passingScore: attempt.passingScore,
        timeSpentSeconds: updated.timeSpentSeconds ?? 0,
        submittedAt: updated.submittedAt!.toISOString(),
      },
    };
  }

  async myAttempts() {
    const attempts = await prisma.testAttempt.findMany({
      where: { teacherId: this.teacherId, submittedAt: { not: null } },
      select: {
        id: true,
        testId: true,
        score: true,
        passed: true,
        submittedAt: true,
        test: { select: { title: true, subject: { select: { name: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      success: true,
      data: attempts.map((attempt) => ({
        id: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        subjectName: attempt.test.subject.name,
        score: attempt.score ?? 0,
        passed: attempt.passed ?? false,
        submittedAt: attempt.submittedAt!.toISOString(),
      })),
    };
  }

  async getAttempt(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          select: {
            title: true,
            durationMinutes: true,
            questions: { select: { id: true, text: true, options: true, imageKey: true, correctIndex: true, order: true }, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!attempt) throw notFound('ATTEMPT_NOT_FOUND', 'attempt not found');
    if (attempt.teacherId !== this.teacherId) throw forbidden('ATTEMPT_FORBIDDEN', 'this attempt does not belong to you');

    if (!attempt.submittedAt) {
      return {
        success: true,
        data: {
          status: 'IN_PROGRESS' as const,
          id: attempt.id,
          testId: attempt.testId,
          testTitle: attempt.test.title,
          durationMinutes: attempt.test.durationMinutes,
          startedAt: attempt.startedAt.toISOString(),
          questions: attempt.test.questions.map(({ id, text, options, imageKey, order }) => ({ id, text, options, imageKey, order })),
        },
      };
    }

    const answers = (attempt.answers as Record<string, number> | null) ?? {};

    return {
      success: true,
      data: {
        status: 'SUBMITTED' as const,
        id: attempt.id,
        testId: attempt.testId,
        testTitle: attempt.test.title,
        score: attempt.score ?? 0,
        correctCount: attempt.correctCount ?? 0,
        questionCount: attempt.questionCount,
        passed: attempt.passed ?? false,
        passingScore: attempt.passingScore,
        timeSpentSeconds: attempt.timeSpentSeconds ?? 0,
        submittedAt: attempt.submittedAt.toISOString(),
        questions: attempt.test.questions.map((question) => ({
          text: question.text,
          options: question.options,
          selectedIndex: answers[question.id] ?? null,
          isCorrect: answers[question.id] === question.correctIndex,
        })),
      },
    };
  }

  private async findOwnedInProgressAttempt(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) throw notFound('ATTEMPT_NOT_FOUND', 'attempt not found');
    if (attempt.teacherId !== this.teacherId) throw forbidden('ATTEMPT_FORBIDDEN', 'this attempt does not belong to you');
    if (attempt.submittedAt) throw badRequest('ATTEMPT_ALREADY_SUBMITTED', 'this attempt has already been submitted');

    return attempt;
  }

  private pickValidAnswers(questions: { id: string }[], answers: Record<string, number>): Record<string, number> {
    const questionIds = new Set(questions.map((question) => question.id));

    return Object.fromEntries(Object.entries(answers).filter(([questionId]) => questionIds.has(questionId)));
  }
}
