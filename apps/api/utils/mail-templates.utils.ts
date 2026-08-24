export const verificationEmail = (code: string) => ({
  subject: 'Ustoz Rating — emailingizni tasdiqlang',
  html: `<p>Ro'yxatdan o'tganingiz uchun rahmat!</p><p>Tasdiqlash kodi: <b style="font-size:20px">${code}</b></p><p>Kod 15 daqiqa amal qiladi.</p>`,
  text: `Tasdiqlash kodi: ${code} (15 daqiqa amal qiladi)`,
});
