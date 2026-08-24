import { customAlphabet } from 'nanoid';
import { renderTemplate } from '@/utils/template.utils';

const CERTIFICATE_CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateCode = customAlphabet(CERTIFICATE_CODE_ALPHABET, 10);

export const generateCertificateId = (): string => `UR-${generateCode()}`;

export const renderCertificateTemplate = renderTemplate;

export const DEFAULT_CERTIFICATE_TEMPLATE_TEXT =
  "Ushbu sertifikat {fullName} {subject} fanidan bilim testini {score}% natija bilan muvaffaqiyatli topshirganligini tasdiqlaydi.";
