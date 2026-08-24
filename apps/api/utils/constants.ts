import { USER_ROLE } from '../generated/prisma';

export const DEFAULT_PAGE_SIZE = 10;

export const BCRYPT_SALT_ROUNDS = 10;

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const UPLOAD_FOLDERS = ['avatar', 'subject'] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_UPLOAD_BYTES_BY_FOLDER: Record<UploadFolder, number> = {
  avatar: MAX_UPLOAD_BYTES,
  subject: MAX_UPLOAD_BYTES,
};

export const READABLE_ASSET_FOLDERS = ['avatar', 'subject'] as const;

export type ReadableAssetFolder = (typeof READABLE_ASSET_FOLDERS)[number];

export const UPLOAD_MIME_TYPES: Record<string, 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'ARCHIVE'> = {
  'image/png': 'IMAGE',
  'image/jpeg': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/avif': 'IMAGE',
  'application/pdf': 'DOCUMENT',
  'text/plain': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'application/zip': 'ARCHIVE',
  'application/x-zip-compressed': 'ARCHIVE',
};

export const ALLOWED_MIME_BY_FOLDER: Record<UploadFolder, readonly string[]> = {
  avatar: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
  subject: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'],
};

export const USER_PUBLIC_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  phone: true,
  gender: true,
  avatar: true,
  locale: true,
  emailVerified: true,
  passwordChangedAt: true,
  active: true,
  regionId: true,
  districtId: true,
  schoolId: true,
  subjectId: true,
  position: true,
  experienceYears: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

export type RoleRequirements = {
  role: USER_ROLE | null;
};
