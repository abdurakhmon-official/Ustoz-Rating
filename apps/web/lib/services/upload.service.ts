import type { ApiResponse } from '@repo/contracts';
import api from '@/lib/axios';

interface UploadPolicy {
  method: 'PUT';
  uploadUrl: string;
  headers: Record<string, string>;
  key: string;
  url: string;
  expiresIn: number;
  maxBytes: number;
}

export class UploadService {
  async generatePolicy(folder: string, file: File): Promise<UploadPolicy> {
    const { data } = await api.get<ApiResponse<UploadPolicy>>('/s3/generate-policy', {
      params: { folder, contentType: file.type, filename: file.name, size: file.size },
    });

    return data.data;
  }

  async upload(folder: string, file: File): Promise<{ key: string; fileName: string }> {
    const policy = await this.generatePolicy(folder, file);

    await fetch(policy.uploadUrl, { method: 'PUT', headers: policy.headers, body: file });

    return { key: policy.key, fileName: file.name };
  }

  /**
   * `AWS_S3_BUCKET` sozlanmagan muhitda (lokal disk fallback) ishlaydigan
   * yo'l — `generatePolicy` esa haqiqiy S3'ni talab qiladi.
   */
  async uploadDirect(folder: string, file: File): Promise<{ key: string; url: string }> {
    const form = new FormData();
    form.append('file', file);

    const { data } = await api.post<ApiResponse<{ key: string; url: string }>>(`/s3/${folder}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data;
  }
}

export const uploadService = new UploadService();
