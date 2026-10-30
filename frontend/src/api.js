// ที่อยู่ของ Backend (เปลี่ยนได้ผ่าน VITE_API_URL ในไฟล์ .env ของ frontend)
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// เรียก Backend แบบ JSON โดยส่ง/รับ Cookie (token) ไปด้วย
export async function callApi(path, method = 'GET', body) {
  const res = await fetch(API + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include', // ต้องมี ไม่งั้น Cookie token จะไม่ถูกส่ง/เก็บ
    body: body ? JSON.stringify(body) : undefined
  })
  // Backend ตอบเป็น JSON เสมอ (มี message ทั้งกรณีสำเร็จและผิดพลาด)
  return res.json()
}
