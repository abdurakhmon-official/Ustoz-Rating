import { Inject, Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { notFound } from '@/utils/errors.utils';
import { AuditService } from '@/services/audit.service';
import type { CreateQuestionInput, UpdateQuestionInput } from '@/inputs/question.input';

@Injectable()
export class QuestionService {
  private static readonly SELECT = {
    id: true,
    testId: true,
    text: true,
    options: true,
    correctIndex: true,
    imageKey: true,
    order: true,
  };

  @Inject()
  private auditService!: AuditService;

  async create(testId: string, input: CreateQuestionInput) {
    await this.assertTestExists(testId);

    const count = await prisma.question.count({ where: { testId } });

    const question = await prisma.question.create({
      data: { ...input, testId, order: count },
      select: QuestionService.SELECT,
    });
    await this.auditService.log('CREATE', 'Question', question.id, undefined, question);

    return { success: true, data: question };
  }

  async update(questionId: string, input: UpdateQuestionInput) {
    const before = await prisma.question.findUnique({ where: { id: questionId }, select: QuestionService.SELECT });
    if (!before) throw notFound('QUESTION_NOT_FOUND', 'question not found');

    const question = await prisma.question.update({
      where: { id: questionId },
      data: input,
      select: QuestionService.SELECT,
    });
    await this.auditService.log('UPDATE', 'Question', questionId, before, question);

    return { success: true, data: question };
  }

  async delete(questionId: string) {
    const before = await prisma.question.findUnique({ where: { id: questionId } });
    if (!before) throw notFound('QUESTION_NOT_FOUND', 'question not found');

    await prisma.question.delete({ where: { id: questionId } });
    await this.auditService.log('DELETE', 'Question', questionId, before, undefined);

    return { success: true, data: null };
  }

  private async assertTestExists(testId: string): Promise<void> {
    const test = await prisma.test.findUnique({ where: { id: testId }, select: { id: true } });
    if (!test) throw notFound('TEST_NOT_FOUND', 'test not found');
  }
}
