import jwt from "jsonwebtoken"

// อ่าน Token จาก Cookie (หรือ Header Authorization: Bearer <token>) แล้วใส่ข้อมูลสมาชิกไว้ที่ req.user
// ไม่บล็อกคำขอ ถ้าไม่มี Token req.user จะเป็น undefined
export function readToken(req, res, next) {
    let token = req.cookies ? req.cookies.token : null
    const auth = req.headers.authorization
    if (!token && auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (token) {
        try {
            // ตรวจสอบ + แปลง JWT เพื่ออ่านข้อมูล
            req.user = jwt.verify(token, process.env.SECRET_KEY)
        }
        catch (err) {
            // Token หมดอายุ หรือถูกแก้ไข --> ถือว่าไม่ได้ login
            console.log(err.message)
        }
    }
    next()
}

// ใช้กับ route ที่ต้อง login เท่านั้น
export function authRequired(req, res, next) {
    if (!req.user)
        return res.status(401).json({ message: `Please login`, login: false })
    next()
}

// ใช้กับ route ที่ admin เท่านั้น (ใช้หลัง authRequired)
export function adminOnly(req, res, next) {
    if (req.user.role != 'admin')
        return res.status(403).json({ message: `Admin only` })
    next()
}
