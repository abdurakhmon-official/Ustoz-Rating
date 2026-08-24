import { z } from 'zod';

// schemas

export const NotificationTypeSchema = z.enum([
  'TEST_PUBLISHED', 
  'ATTEMPT_RESULT', 
  'RATING_CHANGED', 
  'CERTIFICATE_ISSUED'
]);

export const UpdateNotificationTemplateInputSchema = z.object({
  text: z.string().min(1),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
});

// types

export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type UpdateNotificationTemplateInput = z.infer<typeof UpdateNotificationTemplateInputSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// interfaces

export interface NotificationListItem {
  id: string;
  type: NotificationType;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListOutput {
  items: NotificationListItem[];
  unreadCount: number;
}

export interface NotificationTemplateItem {
  type: NotificationType;
  text: string;
}

export interface SearchResultItem {
  id: string;
  label: string;
  description: string | null;
}

export interface SearchOutput {
  teachers: SearchResultItem[];
  schools: SearchResultItem[];
  subjects: SearchResultItem[];
  districts: SearchResultItem[];
  regions: SearchResultItem[];
}
