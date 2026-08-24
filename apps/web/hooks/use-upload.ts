'use client';

import { useMutation } from '@tanstack/react-query';
import { uploadService } from '@/lib/services';

export const useUpload = () => {
  return useMutation({
    mutationFn: ({ folder, file }: { folder: string; file: File }) => uploadService.upload(folder, file),
  });
};

/** Lokal disk fallback bilan ishlaydi — S3 sozlanmagan dev muhitda ham avatar/fan rasmini yuklash mumkin. */
export const useUploadDirect = () => {
  return useMutation({
    mutationFn: ({ folder, file }: { folder: string; file: File }) => uploadService.uploadDirect(folder, file),
  });
};
