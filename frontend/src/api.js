// api.js : ตัวช่วยเรียก Backend (REST API) ให้ทุกหน้าใช้ร่วมกัน

// ที่อยู่ของ Backend (เปลี่ยนได้ผ่าน VITE_API_URL ในไฟล์ .env ของ frontend)
// ถ้าไม่ได้ตั้งค่า จะใช้ http://localhost:3000
export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// เรียก Backend แบบ JSON โดยส่ง/รับ Cookie (token) ไปด้วย
//   path   : เส้นทางของ API เช่น '/api/members/login'
//   method : 'GET' (ค่าเริ่มต้น), 'POST', 'PUT', ...
//   body   : ข้อมูลที่จะส่ง (Object) ถ้าไม่ส่งก็ไม่ต้องใส่
// คืนค่าเป็น Object ที่ Backend ตอบกลับ (มี message เสมอ)
export async function callApi(path, method = 'GET', body) {
  const res = await fetch(API + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include', // <--- สำคัญมาก ต้องมีบรรทัดนี้เพื่อให้ส่ง Cookie token ไปได้
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 204) return { ok: true }
  return res.json()
}
