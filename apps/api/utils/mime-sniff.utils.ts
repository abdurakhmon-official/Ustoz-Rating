const SIGNATURES: { mimeType: string; bytes: number[] }[] = [
  { mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mimeType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mimeType: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mimeType: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] },
  { mimeType: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] },
];

const matches = (buffer: Buffer, bytes: number[]): boolean => bytes.every((byte, index) => buffer[index] === byte);

const isWebp = (buffer: Buffer): boolean =>
  matches(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer.slice(8, 12).toString('ascii') === 'WEBP';

const isAvif = (buffer: Buffer): boolean => buffer.slice(4, 12).toString('ascii') === 'ftypavif';

const isOfficeOpenXml = (buffer: Buffer): boolean => matches(buffer, [0x50, 0x4b, 0x03, 0x04]);

export const matchesDeclaredMimeType = (buffer: Buffer, declaredMimeType: string): boolean => {
  if (declaredMimeType === 'image/webp') return isWebp(buffer);
  if (declaredMimeType === 'image/avif') return isAvif(buffer);
  if (declaredMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return isOfficeOpenXml(buffer);
  }
  if (declaredMimeType === 'application/msword' || declaredMimeType === 'text/plain') return true;

  const signature = SIGNATURES.find((entry) => entry.mimeType === declaredMimeType);
  return signature ? matches(buffer, signature.bytes) : false;
};
