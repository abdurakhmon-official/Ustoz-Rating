import * as XLSX from 'xlsx';
import { badRequest } from '@/utils/errors.utils';

// types

interface ParsedImportRow {
  text: string;
  options: string[];
  correctIndex: number;
}

type RowValidationResult = { row: ParsedImportRow } | { code: string };

const ANSWER_LETTER_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

const HEADER_ALIASES: Record<string, string> = {
  savol: 'text',
  question: 'text',
  a: 'a',
  b: 'b',
  c: 'c',
  d: 'd',
  'togri javob': 'answer',
  "to'gri javob": 'answer',
  javob: 'answer',
  answer: 'answer',
  fan: 'subject',
};

const normalizeHeader = (value: unknown): string =>
  String(value ?? '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .trim();

export const parseImportWorkbook = (buffer: Buffer): Record<string, unknown>[] => {
  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } catch {
    throw badRequest('IMPORT_FILE_UNREADABLE', 'the file could not be read as Excel/CSV');
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw badRequest('IMPORT_FILE_EMPTY', 'the file has no sheets');

  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
};

export const normalizeImportRows = (rawRows: Record<string, unknown>[]): Record<string, unknown>[] => {
  return rawRows.map((rawRow) => {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rawRow)) {
      const alias = HEADER_ALIASES[normalizeHeader(key)];
      if (alias) normalized[alias] = value;
    }
    return normalized;
  });
};

export const validateImportRow = (row: Record<string, unknown>): RowValidationResult => {
  const text = String(row.text ?? '').trim();
  const a = String(row.a ?? '').trim();
  const b = String(row.b ?? '').trim();
  const c = String(row.c ?? '').trim();
  const d = String(row.d ?? '').trim();
  const answer = String(row.answer ?? '')
    .trim()
    .toUpperCase();

  if (!text) return { code: 'IMPORT_ROW_TEXT_EMPTY' };
  if (!a || !b || !c || !d) return { code: 'IMPORT_ROW_OPTIONS_INCOMPLETE' };

  const correctIndex = ANSWER_LETTER_TO_INDEX[answer];
  if (correctIndex === undefined) return { code: 'IMPORT_ROW_ANSWER_INVALID' };

  return { row: { text, options: [a, b, c, d], correctIndex } };
};

export type { ParsedImportRow };
