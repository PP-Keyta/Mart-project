// auth.js : middleware อ่าน Token แล้วใส่ข้อมูลสมาชิกไว้ที่ req.user
// ใช้ให้ส่วนอื่นของระบบ (เช่น cartController ที่อ่าน req.user.id) รู้ว่าใคร login อยู่
// หมายเหตุ: ฟังก์ชันของสมาชิก (memberController) ตรวจ Token ในตัวเองอยู่แล้ว ไม่ได้พึ่งไฟล์นี้
import jwt from "jsonwebtoken"

// อ่าน Token จาก Header Authorization: Bearer <token> หรือ Cookie ชื่อ token
// ถ้ามีทั้งสองอย่าง ใช้ Header ก่อน (ผู้เรียกระบุตัวตนชัดเจนกว่า Cookie ที่ Browser แนบให้เอง)
// ไม่บล็อกคำขอ: ถ้าไม่มี Token หรือ Token ไม่ถูกต้อง req.user จะเป็น undefined แล้วปล่อยให้ route นั้นตัดสินใจเอง
export function readToken(req, res, next) {
    let token = req.cookies ? req.cookies.token : null
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7) // ตัดคำว่า "Bearer " (7 ตัวอักษร) ออก เหลือแต่ Token
    if (token) {
        try {
            // ตรวจสอบ + แปลง JWT เพื่ออ่านข้อมูล { id, email, name, role }
            req.user = jwt.verify(token, process.env.SECRET_KEY)
        }
        catch (err) {
            // Token หมดอายุ หรือถูกแก้ไข --> ถือว่าไม่ได้ login
            console.log(err.message)
        }
    }
    next()
}
