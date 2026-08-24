import type { LegalDocumentType } from '@repo/contracts';

export const DEFAULT_LEGAL_DOCUMENT_TEXT: Record<LegalDocumentType, string> = {
  TERMS:
    "Ushbu Foydalanish shartlari \"Ustoz Rating\" platformasidan foydalanish tartibini belgilaydi. " +
    'Platformadan foydalanish orqali siz ushbu shartlarga rioya qilishga rozilik bildirasiz. ' +
    'Administrator ushbu matnni istalgan vaqtda yangilashi mumkin.',
  PRIVACY:
    "Ushbu Maxfiylik siyosati \"Ustoz Rating\" platformasi foydalanuvchilarning shaxsiy ma'lumotlarini qanday " +
    "yig'ishi, saqlashi va ishlatishini tavsiflaydi. Administrator ushbu matnni istalgan vaqtda yangilashi mumkin.",
};
