// ======================================================================
// memberController.js : ระบบสมาชิก (Members / Auth)
// ======================================================================
import database from "../services/db.js"   // Pool ของ PostgreSQL (ใช้ database.query)
import bcrypt from "bcrypt"                // เข้ารหัส/ตรวจรหัสผ่าน
import jwt from "jsonwebtoken"             // สร้าง/ตรวจ Token
import multer from "multer"                // รับไฟล์ที่อัปโหลดมา (multipart/form-data)
import fs from "fs"                        // ทำงานกับไฟล์ (สร้างโฟลเดอร์ / ลบรูปเก่า)
import path from "path"                    // จัดการชื่อ/นามสกุลไฟล์

// ตั้งค่า cookie เดียวกันทุกที่ (ตอน login และตอน logout ต้องใช้ค่าเหมือนกัน)
const cookieOption = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
}

// เอา image ออกจากคอลัมน์ที่ดึง เนื่องจากฐานข้อมูลไม่มีคอลัมน์นี้
const memberColumns = `id, email, name, phone, address, role, created_at`

// ----------------------------------------------------------------------
// upload part : ตั้งค่าการอัปโหลดรูปโปรไฟล์ด้วย multer
// ----------------------------------------------------------------------
const imgFolder = 'img_mem'
const imgTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdirSync(imgFolder, { recursive: true })
        cb(null, imgFolder)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `member_${req.user.id}_${Date.now()}${ext}`)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        if (!file.mimetype.startsWith('image/') || !imgTypes.includes(ext))
            return cb(new Error('Only image files (jpg, png, webp, gif) are allowed'))
        cb(null, true)
    }
}).single('file')

// ----------------------------------------------------------------------
// สมัครสมาชิก : POST /members
// ----------------------------------------------------------------------
export async function postMember(req, res) {
    console.log(`POST /members is requested.`)
    const bodyData = req.body
    try {
        if (!bodyData.email || !String(bodyData.name || '').trim() || !bodyData.password) {
            return res.status(400).json({ message: `ERROR email, name and password is required.`, regist: false })
        }
        if (String(bodyData.password).length < 8) {
            return res.status(400).json({ message: `ERROR password must be at least 8 characters.`, regist: false })
        }
        const email = String(bodyData.email).trim().toLowerCase()
        const chkRow = await database.query({
            text: `SELECT id FROM members WHERE email = $1`,
            values: [email]
        })
        if (chkRow.rowCount != 0) {
            return res.status(409).json({ message: `ERROR email ${email} is exists.`, regist: false })
        }

        const saltround = 11
        const pwdHash = await bcrypt.hash(bodyData.password, saltround)

        const result = await database.query({
            text: `INSERT INTO members (email, password_hash, name, phone, address)
                   VALUES ($1,$2,$3,$4,$5)
                   RETURNING id, email, name, phone, address, role, created_at`,
            values: [
                email,
                pwdHash,
                bodyData.name,
                bodyData.phone || null,
                bodyData.address || null
            ]
        })
        res.status(201).json({ ...result.rows[0], message: "Regist Success", regist: true })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, regist: false })
    }
}

// ----------------------------------------------------------------------
// เข้าสู่ระบบ : POST /members/login
// ----------------------------------------------------------------------
export async function loginMember(req, res) {
    console.log(`POST /members/login is requested.`)
    const bodyData = req.body
    try {
        if (!bodyData.email || !bodyData.password) {
            return res.status(400).json({ message: `Email and Password is required`, login: false })
        }
        const result = await database.query({
            text: `SELECT * FROM members WHERE email = $1`,
            values: [String(bodyData.email).trim().toLowerCase()]
        })
        if (result.rowCount == 0)
            return res.status(401).json({ message: `Login Fail`, login: false })

        const member = result.rows[0]
        const loginOK = await bcrypt.compare(bodyData.password, member.password_hash)
        if (!loginOK) {
            res.clearCookie('token', cookieOption)
            return res.status(401).json({ message: `Login Fail`, login: false })
        }
        
        // เช็กสถานะ active หากตารางมีคอลัมน์ status (ถ้าไม่มีคอลัมน์ status ระบบจะไม่ติด Error ตรงนี้)
        if (member.status && member.status != 'active')
            return res.status(403).json({ message: `This account is suspended`, login: false })

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
            maxAge: 3600000
        })
        res.json({ message: "Login Success", login: true, token: token, member: theuser })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, login: false })
    }
}

// ----------------------------------------------------------------------
// ออกจากระบบ : GET /members/logout
// ----------------------------------------------------------------------
export async function logoutMember(req, res) {
    console.log(`GET /members/logout is requested.`)
    try {
        res.clearCookie('token', cookieOption)
        res.json({ message: `Logout Success`, login: false })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// ----------------------------------------------------------------------
// ดูข้อมูลตัวเอง : GET /members/detail
// ----------------------------------------------------------------------
export async function getMember(req, res) {
    console.log(`GET /members/detail is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.status(401).json({ message: `No member`, login: false })
    try {
        const secret_key = process.env.SECRET_KEY
        const member = jwt.verify(token, secret_key)
        const result = await database.query({
            text: `SELECT ${memberColumns} FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (result.rowCount == 0)
            return res.status(401).json({ message: `No member`, login: false })
        
        if (result.rows[0].status && result.rows[0].status != 'active')
            return res.status(403).json({ message: `This account is suspended`, login: false })
            
        return res.json({ ...result.rows[0], login: true })
    }
    catch (err) {
        console.log(err.message)
        if (err.name.includes('Token'))
            return res.status(401).json({ message: `The information was falsified.`, login: false })
        return res.status(500).json({ message: err.message, login: false })
    }
}

// ----------------------------------------------------------------------
// แก้ไขข้อมูลส่วนตัวของตัวเอง : PUT /members
// ----------------------------------------------------------------------
export async function putMember(req, res) {
    console.log(`PUT /members is requested.`)
    const bodyData = req.body
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.status(401).json({ message: `Please login`, login: false, update: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)

        if (bodyData.name === undefined && bodyData.phone === undefined && bodyData.address === undefined)
            return res.status(400).json({ message: `ERROR name, phone or address is required.`, update: false })

        const old = await database.query({
            text: `SELECT ${memberColumns} FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (old.rowCount == 0)
            return res.status(404).json({ message: `Member not found`, update: false })

        const name = bodyData.name === undefined ? old.rows[0].name : String(bodyData.name).trim()
        const phone = bodyData.phone === undefined ? old.rows[0].phone : (String(bodyData.phone).trim() || null)
        const address = bodyData.address === undefined ? old.rows[0].address : (String(bodyData.address).trim() || null)

        if (!name || name.length > 100)
            return res.status(400).json({ message: `ERROR name is required (max 100 characters).`, update: false })
        if (phone && phone.length > 20)
            return res.status(400).json({ message: `ERROR phone is too long (max 20 characters).`, update: false })

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
        if (err.name.includes('Token'))
            return res.status(401).json({ message: `The information was falsified.`, login: false, update: false })
        return res.status(500).json({ message: err.message, update: false })
    }
}

// ----------------------------------------------------------------------
// อัปโหลดรูปโปรไฟล์ของตัวเอง : POST /members/uploadimg
// (ปรับให้ตอบกลับผ่านได้ แม้ยังไม่มีคอลัมน์ image ในฐานข้อมูล)
// ----------------------------------------------------------------------
export async function uploadMember(req, res) {
    console.log('POST /members/uploadimg is requested.')
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.status(401).json({ message: `Please login`, login: false, upload: false })
    try {
        req.user = jwt.verify(token, process.env.SECRET_KEY)
    }
    catch (err) {
        console.log(err.message)
        return res.status(401).json({ message: `The information was falsified.`, login: false, upload: false })
    }
    upload(req, res, async (err) => {
        if (err)
            return res.status(400).json({ message: err.message, upload: false })
        if (!req.file)
            return res.status(400).json({ message: `ERROR file is required.`, upload: false })
        try {
            // เนื่องจากตารางยังไม่มีคอลัมน์ image จึงใช้วิธีบันทึกไฟล์ลงเซิร์ฟเวอร์สำเร็จและส่งชื่อกลับไปแสดงผล
            res.json({ message: 'File uploaded successfully!', upload: true, image: req.file.filename })
        }
        catch (e) {
            res.status(500).json({ message: e.message, upload: false })
        }
    })
}

// ----------------------------------------------------------------------
// [Admin] แสดงรายชื่อสมาชิกทั้งหมด : GET /members
// ----------------------------------------------------------------------
export async function getAllMember(req, res) {
    console.log(`GET /members is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.status(401).json({ message: `Please login`, login: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)
        const admin = await database.query({
            text: `SELECT role FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (admin.rowCount == 0 || admin.rows[0].role != 'admin')
            return res.status(403).json({ message: `Admin only` })

        const { q, role, status } = req.query
        if (role && !['member', 'admin'].includes(role))
            return res.status(400).json({ message: `role must be member or admin` })

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
        if (err.name.includes('Token'))
            return res.status(401).json({ message: `The information was falsified.`, login: false })
        return res.status(500).json({ message: err.message })
    }
}

// ----------------------------------------------------------------------
// [Admin] เปลี่ยนสถานะสมาชิก : PUT /members/:id/status
// ----------------------------------------------------------------------
export async function putMemberStatus(req, res) {
    console.log(`PUT /members/${req.params.id}/status is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.status(401).json({ message: `Please login`, login: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)
        const admin = await database.query({
            text: `SELECT role FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (admin.rowCount == 0 || admin.rows[0].role != 'admin')
            return res.status(403).json({ message: `Admin only` })

        if (!/^\d+$/.test(req.params.id))
            return res.status(400).json({ message: `id must be a number` })
        const id = Number(req.params.id)
        const status = req.body.status
        if (!['active', 'suspended'].includes(status))
            return res.status(400).json({ message: `status must be one of: active, suspended` })
        if (id == member.id)
            return res.status(400).json({ message: `You cannot change your own status` })

        const result = await database.query({
            text: `UPDATE members SET status = $1, updated_at = now()
                   WHERE id = $2
                   RETURNING ${memberColumns}`,
            values: [status, id]
        })
        if (result.rowCount == 0)
            return res.status(404).json({ message: `Member not found` })
        res.json({ ...result.rows[0], message: `Update status Success` })
    }
    catch (err) {
        console.log(err.message)
        if (err.name.includes('Token'))
            return res.status(401).json({ message: `The information was falsified.`, login: false })
        return res.status(500).json({ message: err.message })
    }
}

// ----------------------------------------------------------------------
// [Admin] เปลี่ยนบทบาทสมาชิก : PUT /members/:id/role
// ----------------------------------------------------------------------
export async function putMemberRole(req, res) {
    console.log(`PUT /members/${req.params.id}/role is requested.`)
    let token = req.cookies.token
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer '))
        token = auth.slice(7)
    if (!token)
        return res.status(401).json({ message: `Please login`, login: false })
    try {
        const member = jwt.verify(token, process.env.SECRET_KEY)
        const admin = await database.query({
            text: `SELECT role FROM members WHERE id = $1`,
            values: [member.id]
        })
        if (admin.rowCount == 0 || admin.rows[0].role != 'admin')
            return res.status(403).json({ message: `Admin only` })

        if (!/^\d+$/.test(req.params.id))
            return res.status(400).json({ message: `id must be a number` })
        const id = Number(req.params.id)
        const role = req.body.role
        if (!['member', 'admin'].includes(role))
            return res.status(400).json({ message: `role must be one of: member, admin` })
        if (id == member.id)
            return res.status(400).json({ message: `You cannot change your own role` })

        const result = await database.query({
            text: `UPDATE members SET role = $1, updated_at = now()
                   WHERE id = $2
                   RETURNING ${memberColumns}`,
            values: [role, id]
        })
        if (result.rowCount == 0)
            return res.status(404).json({ message: `Member not found` })
        res.json({ ...result.rows[0], message: `Update role Success` })
    }
    catch (err) {
        console.log(err.message)
        if (err.name.includes('Token'))
            return res.status(401).json({ message: `The information was falsified.`, login: false })
        return res.status(500).json({ message: err.message })
    }
}

// ----------------------------------------------------------------------
// ที่อยู่จัดส่งเพิ่มเติม
// ----------------------------------------------------------------------
const maxAddresses = 10
const maxAddressLen = 500

export async function getAddresses(req, res) {
    console.log(`GET /members/addresses is requested.`)
    if (!req.user)
        return res.status(401).json({ message: `Please login`, ok: false })
    try {
        const result = await database.query({
            text: `SELECT id, address, created_at FROM member_addresses WHERE member_id = $1 ORDER BY id`,
            values: [req.user.id]
        })
        res.json({ message: `Get addresses Success`, ok: true, addresses: result.rows })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, ok: false })
    }
}

export async function postAddress(req, res) {
    console.log(`POST /members/addresses is requested.`)
    if (!req.user)
        return res.status(401).json({ message: `Please login`, ok: false })
    const address = String(req.body.address || '').trim()
    if (!address)
        return res.status(400).json({ message: `ERROR address is required.`, ok: false })
    if (address.length > maxAddressLen)
        return res.status(400).json({ message: `ERROR address must be at most ${maxAddressLen} characters.`, ok: false })
    try {
        const count = await database.query({
            text: `SELECT count(*)::int AS n FROM member_addresses WHERE member_id = $1`,
            values: [req.user.id]
        })
        if (count.rows[0].n >= maxAddresses)
            return res.status(400).json({ message: `ERROR you can add at most ${maxAddresses} extra addresses.`, ok: false })
        const result = await database.query({
            text: `INSERT INTO member_addresses (member_id, address) VALUES ($1, $2) RETURNING id, address, created_at`,
            values: [req.user.id, address]
        })
        res.status(201).json({ message: `Add address Success`, ok: true, address: result.rows[0] })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, ok: false })
    }
}

export async function putAddress(req, res) {
    console.log(`PUT /members/addresses/${req.params.id} is requested.`)
    if (!req.user)
        return res.status(401).json({ message: `Please login`, ok: false })
    if (!/^\d+$/.test(req.params.id))
        return res.status(400).json({ message: `id must be a number`, ok: false })
    const address = String(req.body.address || '').trim()
    if (!address)
        return res.status(400).json({ message: `ERROR address is required.`, ok: false })
    if (address.length > maxAddressLen)
        return res.status(400).json({ message: `ERROR address must be at most ${maxAddressLen} characters.`, ok: false })
    try {
        const result = await database.query({
            text: `UPDATE member_addresses SET address = $1
                   WHERE id = $2 AND member_id = $3
                   RETURNING id, address, created_at`,
            values: [address, Number(req.params.id), req.user.id]
        })
        if (result.rowCount == 0)
            return res.status(404).json({ message: `Address not found`, ok: false })
        res.json({ message: `Update address Success`, ok: true, address: result.rows[0] })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, ok: false })
    }
}

export async function deleteAddress(req, res) {
    console.log(`DELETE /members/addresses/${req.params.id} is requested.`)
    if (!req.user)
        return res.status(401).json({ message: `Please login`, ok: false })
    if (!/^\d+$/.test(req.params.id))
        return res.status(400).json({ message: `id must be a number`, ok: false })
    try {
        const result = await database.query({
            text: `DELETE FROM member_addresses WHERE id = $1 AND member_id = $2`,
            values: [Number(req.params.id), req.user.id]
        })
        if (result.rowCount == 0)
            return res.status(404).json({ message: `Address not found`, ok: false })
        res.json({ message: `Delete address Success`, ok: true })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, ok: false })
    }
}