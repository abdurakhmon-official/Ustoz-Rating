import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { badRequest, notFound } from '@/utils/errors.utils';
import { normalizeImportRows, parseImportWorkbook, validateImportRow } from '@/utils/question-import.utils';
import type { ImportQuestionsError, ImportQuestionsResult } from '@repo/contracts';

@Injectable()
export class QuestionImportService {
  private static readonly MAX_ROWS = 2000;

  async importFromFile(testId: string, buffer: Buffer | undefined): Promise<{ success: true; data: ImportQuestionsResult }> {
    if (!buffer) throw badRequest('IMPORT_FILE_REQUIRED', 'file is required');

    await this.assertTestExists(testId);

    const rows = normalizeImportRows(parseImportWorkbook(buffer));
    if (rows.length > QuestionImportService.MAX_ROWS) {
      throw badRequest('IMPORT_TOO_MANY_ROWS', `a single import cannot exceed ${QuestionImportService.MAX_ROWS} rows`);
    }

    const errors: ImportQuestionsError[] = [];
    const valid = rows.flatMap((row, index) => {
      const result = validateImportRow(row);
      if ('code' in result) {
        errors.push({ row: index + 2, message: result.code });
        return [];
      }
      return [result.row];
    });

    if (valid.length > 0) await this.insertQuestions(testId, valid);

    return { success: true, data: { imported: valid.length, errors } };
  }

  private async insertQuestions(testId: string, rows: { text: string; options: string[]; correctIndex: number }[]): Promise<void> {
    const startOrder = await prisma.question.count({ where: { testId } });

    await prisma.question.createMany({
      data: rows.map((row, index) => ({
        testId,
        text: row.text,
        options: row.options,
        correctIndex: row.correctIndex,
        order: startOrder + index,
      })),
    });
  }

  private async assertTestExists(testId: string): Promise<void> {
    const test = await prisma.test.findUnique({ where: { id: testId }, select: { id: true } });
    if (!test) throw notFound('TEST_NOT_FOUND', 'test not found');
  }
}
