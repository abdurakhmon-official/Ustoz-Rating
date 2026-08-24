import { customAlphabet } from 'nanoid';

const CERTIFICATE_CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateCode = customAlphabet(CERTIFICATE_CODE_ALPHABET, 10);

export const generateCertificateId = (): string => `UR-${generateCode()}`;

export const renderCertificateTemplate = (template: string, values: Record<string, string | number>): string => {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
};
