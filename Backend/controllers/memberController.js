import database from "../services/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer"
import fs from "fs"
import path from "path"

// ตั้งค่า cookie เดียวกันทุกที่ (ตอน login และตอน logout ต้องใช้ค่าเหมือนกัน)
const cookieOption = {
    httpOnly: true, // ป้องกันการเข้าถึง Token ผ่าน JavaScript (ป้องกัน XSS)
    secure: true,
    sameSite: 'strict' // ป้องกันส่ง Cookie ข้าม Domain
}

// คอลัมน์ที่ส่งกลับให้ Frontend ได้ (ไม่มี password_hash)
const memberColumns = `id, email, name, phone, address, image, role, status, created_at`

// upload part
// 1. กำหนดค่า storage (พื้นที่จัดเก็บไฟล์)
const imgFolder = 'img_mem'
const imgTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const storage = multer.diskStorage({
    // destination: กำหนดโฟลเดอร์ปลายทางที่จะเก็บไฟล์
    destination: function (req, file, cb) {
        fs.mkdirSync(imgFolder, { recursive: true })
        cb(null, imgFolder)
    },
    // filename: ตั้งชื่อไฟล์จาก id สมาชิก (req.user ถูกใส่ไว้ใน uploadMember) + เวลา เพื่อไม่ให้ชื่อซ้ำ
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `member_${req.user.id}_${Date.now()}${ext}`)
    }
})

// 2. การกำหนดค่า uploader รับเฉพาะไฟล์รูปภาพ ขนาดไม่เกิน 2 MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        if (!file.mimetype.startsWith('image/') || !imgTypes.includes(ext))
            return cb(new Error('Only image files (jpg, png, webp, gif) are allowed'))
        cb(null, true)
    }
}).single('file') // รับไฟล์เดี่ยว และ field name ในฟอร์มต้องชื่อ 'file'

export async function postMember(req, res) {
    console.log(`POST /members is requested.`)
    const bodyData = req.body
    try {
        // ตรวจสอบ email, name และ password
        if (!bodyData.email || !bodyData.name || !bodyData.password) {
            return res.json({ message: `ERROR email, name and password is required.`, regist: false })
        }
        if (String(bodyData.password).length < 8) {
            return res.json({ message: `ERROR password must be at least 8 characters.`, regist: false })
        }
        // ตรวจสอบ Unique key ของ email
        const chkRow = await database.query({
            text: `SELECT id FROM members WHERE email = $1`,
            values: [bodyData.email]
        })
        if (chkRow.rowCount != 0) {
            return res.json({ message: `ERROR email ${bodyData.email} is exists.`, regist: false })
        }

        // ระบบเราจะไม่เก็บ Password จะเก็บค่า Hash
        const saltround = 11 // จำนวนรอบการ Salt -- ตัวเลขยิ่งมากยิ่งช้า
        const pwdHash = await bcrypt.hash(bodyData.password, saltround)

        // role กับ status ใช้ค่า default ของตาราง (member / active) ไม่รับจาก Frontend
        const result = await database.query({
            text: `INSERT INTO members (email, password_hash, name, phone, address)
                   VALUES ($1,$2,$3,$4,$5)
                   RETURNING id, email, name, phone, address, role, created_at`,
            values: [
                bodyData.email,
                pwdHash,
                bodyData.name,
                bodyData.phone || null,
                bodyData.address || null
            ]
        })
        // ไม่ส่ง password กลับไป
        res.json({ ...result.rows[0], message: "Regist Success", regist: true })
    }
    catch (err) {
        return res.json({ message: err.message, regist: false })
    }
}

export async function loginMember(req, res) {
    console.log(`POST /members/login is requested.`)
    const bodyData = req.body
    try {
        // ตรวจสอบ email กับ password
        if (!bodyData.email || !bodyData.password) {
            return res.json({ message: `Email and Password is required`, login: false })
        }
        // ตรวจสอบว่ามี email นี้หรือไม่
        const result = await database.query({
            text: `SELECT * FROM members WHERE email = $1`,
            values: [bodyData.email]
        })
        // ถ้าไม่พบ หรือรหัสผ่านไม่ตรง ตอบข้อความเดียวกัน (ไม่บอกว่าผิดที่ email หรือ password)
        if (result.rowCount == 0)
            return res.json({ message: `Login Fail`, login: false })

        const member = result.rows[0]
        // นำค่า hash จาก DB เทียบกับ password ที่ frontend ส่งมา โดยใช้ bcrypt
        const loginOK = await bcrypt.compare(bodyData.password, member.password_hash)
        if (!loginOK) {
            res.clearCookie('token', cookieOption)
            return res.json({ message: `Login Fail`, login: false })
        }
        // บัญชีถูกระงับ
        if (member.status != 'active')
            return res.json({ message: `This account is suspended`, login: false })

        const theuser = {
            id: member.id,
            email: member.email,
            name: member.name,
            role: member.role
        }
        const secretKey = process.env.SECRET_KEY
        const token = jwt.sign(theuser, secretKey, { expiresIn: '1h' })

        res.cookie('token', token, {
            ...cookieOption,
            maxAge: 3600000 // 3,600,000 ms --> 60 minute --> 1hr
        })
        res.json({ message: "Login Success", login: true, token: token, member: theuser })
    }
    catch (err) {
        return res.json({ message: err.message, login: false })
    }
}

export async function logoutMember(req, res) {
    console.log(`GET /members/logout is requested.`)
    try {
        res.clearCookie('token', cookieOption)
        res.json({ message: `Logout Success`, login: false })
    }
    catch (err) {
        return res.json({ message: err.message })
    }
}

export async function getMember(req, res) {
    console.log(`GET /members/detail is requested.`)
    // อ่านค่าจาก Cookies ที่ส่งมาจาก Browser --> Frontend --> Backend
    // (ตอนทดสอบด้วย Postman ส่งผ่าน Header Authorization: Bearer <token> ได้ และใช้ Header ก่อน Cookie)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.json({ message: `No member`, login: false })
    try {
        const secret_key = process.env.SECRET_KEY //อ่านค่าจาก ENV
        // ตรวจสอบ + แปลง JWT เพื่ออ่านข้อมูล
        const member = jwt.verify(token, secret_key)
        // อ่านข้อมูลล่าสุดจาก DB (ข้อมูลใน Token อาจเก่า)
        const result = await database.query({
            text: `SELECT ${memberColumns} FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (result.rowCount == 0)
            return res.json({ message: `No member`, login: false })
        if (result.rows[0].status != 'active')
            return res.json({ message: `This account is suspended`, login: false })
        return res.json({ ...result.rows[0], login: true })
    }
    catch (err) {
        // ถ้ามีการเปลี่ยนแปลง Token/Signature ไม่ถูกต้อง จะเกิด Error
        console.log(err.message)
        return res.json({ message: `The information was falsified.`, login: false })
    }
}

// แก้ไขข้อมูลส่วนตัวของตัวเอง (name, phone, address) -- email และ role แก้ไม่ได้
export async function putMember(req, res) {
    console.log(`PUT /members is requested.`)
    const bodyData = req.body
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.json({ message: `Please login`, login: false, update: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)

        if (bodyData.name === undefined && bodyData.phone === undefined && bodyData.address === undefined)
            return res.json({ message: `ERROR name, phone or address is required.`, update: false })

        const old = await database.query({
            text: `SELECT ${memberColumns} FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (old.rowCount == 0)
            return res.json({ message: `Member not found`, update: false })

        // ค่าที่ไม่ได้ส่งมา ใช้ค่าเดิม
        const name = bodyData.name === undefined ? old.rows[0].name : String(bodyData.name).trim()
        const phone = bodyData.phone === undefined ? old.rows[0].phone : (String(bodyData.phone).trim() || null)
        const address = bodyData.address === undefined ? old.rows[0].address : (String(bodyData.address).trim() || null)

        if (!name || name.length > 100)
            return res.json({ message: `ERROR name is required (max 100 characters).`, update: false })
        if (phone && phone.length > 20)
            return res.json({ message: `ERROR phone is too long (max 20 characters).`, update: false })

        const result = await database.query({
            text: `UPDATE members SET name = $1, phone = $2, address = $3, updated_at = now()
                   WHERE id = $4
                   RETURNING ${memberColumns}`,
            values: [name, phone, address, member.id]
        })
        res.json({ ...result.rows[0], message: "Update Success", update: true })
    }
    catch (err) {
        console.log(err.message)
        return res.json({ message: `The information was falsified.`, login: false, update: false })
    }
}

// 3.Method ให้ Frontend เรียกใช้ -- อัปโหลดรูปโปรไฟล์ของตัวเอง
export async function uploadMember(req, res) {
    console.log('POST /members/uploadimg is requested.')
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.json({ message: `Please login`, login: false, upload: false })
    try {
        // เก็บข้อมูลสมาชิกไว้ที่ req.user เพื่อให้ multer ใช้ตั้งชื่อไฟล์
        req.user = jwt.verify(token, process.env.SECRET_KEY)
    }
    catch (err) {
        console.log(err.message)
        return res.json({ message: `The information was falsified.`, login: false, upload: false })
    }
    upload(req, res, async (err) => {
        if (err)
            return res.json({ message: err.message, upload: false })
        if (!req.file)
            return res.json({ message: `ERROR file is required.`, upload: false })
        try {
            const old = await database.query({
                text: `SELECT image FROM members WHERE id = $1`,
                values: [req.user.id]
            })
            await database.query({
                text: `UPDATE members SET image = $1, updated_at = now() WHERE id = $2`,
                values: [req.file.filename, req.user.id]
            })
            // ลบรูปเก่าของสมาชิกคนนี้ (ใช้เฉพาะชื่อไฟล์ ป้องกันการอ้าง path อื่น)
            const oldImage = old.rows[0] && old.rows[0].image
            if (oldImage) {
                const oldPath = path.join(imgFolder, path.basename(oldImage))
                fs.rm(oldPath, { force: true }, () => { })
            }
            res.json({ message: 'File uploaded successfully!', upload: true, image: req.file.filename })
        }
        catch (e) {
            res.json({ message: e.message, upload: false })
        }
    })
}

// Admin: แสดงรายชื่อสมาชิกทั้งหมด (ค้นหาด้วย ?q= และกรองด้วย ?role= ?status=)
export async function getAllMember(req, res) {
    console.log(`GET /members is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.json({ message: `Please login`, login: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)
        // ตรวจ role และ status ล่าสุดจาก DB (ไม่เชื่อ role ใน Token) เพื่อให้การลดสิทธิ์/ระงับบัญชีมีผลทันที
        const admin = await database.query({
            text: `SELECT role, status FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (admin.rowCount == 0 || admin.rows[0].role != 'admin' || admin.rows[0].status != 'active')
            return res.json({ message: `Admin only` })

        const { q, role, status } = req.query
        if (role && !['member', 'admin'].includes(role))
            return res.json({ message: `role must be member or admin` })
        if (status && !['active', 'suspended'].includes(status))
            return res.json({ message: `status must be active or suspended` })

        const where = []
        const values = []
        if (q) {
            values.push(`%${q}%`)
            where.push(`(email ILIKE $${values.length} OR name ILIKE $${values.length})`)
        }
        if (role) {
            values.push(role)
            where.push(`role = $${values.length}`)
        }
        if (status) {
            values.push(status)
            where.push(`status = $${values.length}`)
        }
        const result = await database.query({
            text: `SELECT ${memberColumns} FROM members
                   ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                   ORDER BY id`,
            values: values
        })
        res.json({ total: result.rowCount, data: result.rows })
    }
    catch (err) {
        console.log(err.message)
        return res.json({ message: `The information was falsified.`, login: false })
    }
}

// Admin: เปลี่ยนสถานะสมาชิก (active / suspended)
export async function putMemberStatus(req, res) {
    console.log(`PUT /members/${req.params.id}/status is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.json({ message: `Please login`, login: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)
        const admin = await database.query({
            text: `SELECT role, status FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (admin.rowCount == 0 || admin.rows[0].role != 'admin' || admin.rows[0].status != 'active')
            return res.json({ message: `Admin only` })

        if (!/^\d+$/.test(req.params.id))
            return res.json({ message: `id must be a number` })
        const id = Number(req.params.id)
        const status = req.body.status
        if (!['active', 'suspended'].includes(status))
            return res.json({ message: `status must be one of: active, suspended` })
        // กันไม่ให้ admin ระงับตัวเอง
        if (id == member.id)
            return res.json({ message: `You cannot change your own status` })

        const result = await database.query({
            text: `UPDATE members SET status = $1, updated_at = now()
                   WHERE id = $2
                   RETURNING ${memberColumns}`,
            values: [status, id]
        })
        if (result.rowCount == 0)
            return res.json({ message: `Member not found` })
        res.json({ ...result.rows[0], message: `Update status Success` })
    }
    catch (err) {
        console.log(err.message)
        return res.json({ message: `The information was falsified.`, login: false })
    }
}

// Admin: เปลี่ยนบทบาทสมาชิก (member / admin) -- ใช้เพิ่ม admin
export async function putMemberRole(req, res) {
    console.log(`PUT /members/${req.params.id}/role is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.json({ message: `Please login`, login: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)
        const admin = await database.query({
            text: `SELECT role, status FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (admin.rowCount == 0 || admin.rows[0].role != 'admin' || admin.rows[0].status != 'active')
            return res.json({ message: `Admin only` })

        if (!/^\d+$/.test(req.params.id))
            return res.json({ message: `id must be a number` })
        const id = Number(req.params.id)
        const role = req.body.role
        if (!['member', 'admin'].includes(role))
            return res.json({ message: `role must be one of: member, admin` })
        // กันไม่ให้ admin ลดสิทธิ์ตัวเอง
        if (id == member.id)
            return res.json({ message: `You cannot change your own role` })

        const result = await database.query({
            text: `UPDATE members SET role = $1, updated_at = now()
                   WHERE id = $2
                   RETURNING ${memberColumns}`,
            values: [role, id]
        })
        if (result.rowCount == 0)
            return res.json({ message: `Member not found` })
        res.json({ ...result.rows[0], message: `Update role Success` })
    }
    catch (err) {
        console.log(err.message)
        return res.json({ message: `The information was falsified.`, login: false })
    }
}
