import database from "../services/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// ตั้งค่า cookie เดียวกันทุกที่ (ตอน login และตอน logout ต้องใช้ค่าเหมือนกัน)
const cookieOption = {
    httpOnly: true, // ป้องกันการเข้าถึง Token ผ่าน JavaScript (ป้องกัน XSS)
    secure: true,
    sameSite: 'strict' // ป้องกันส่ง Cookie ข้าม Domain
}

export async function postMember(req, res) {
    console.log(`POST /members is requested.`)
    const bodyData = req.body
    try {
        // ตรวจสอบ email, name และ password
        if (!bodyData.email || !bodyData.name || !bodyData.password) {
            return res.status(400).json({ message: `ERROR email, name and password is required.`, regist: false })
        }
        if (String(bodyData.password).length < 8) {
            return res.status(400).json({ message: `ERROR password must be at least 8 characters.`, regist: false })
        }
        // ตรวจสอบ Unique key ของ email
        const chkRow = await database.query({
            text: `SELECT id FROM members WHERE email = $1`,
            values: [bodyData.email]
        })
        if (chkRow.rowCount != 0) {
            return res.status(409).json({ message: `ERROR email ${bodyData.email} is exists.`, regist: false })
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
        res.status(201).json({ ...result.rows[0], message: "Regist Success", regist: true })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, regist: false })
    }
}

export async function loginMember(req, res) {
    console.log(`POST /members/login is requested.`)
    const bodyData = req.body
    try {
        // ตรวจสอบ email กับ password
        if (!bodyData.email || !bodyData.password) {
            return res.status(400).json({ message: `Email and Password is required`, login: false })
        }
        // ตรวจสอบว่ามี email นี้หรือไม่
        const result = await database.query({
            text: `SELECT * FROM members WHERE email = $1`,
            values: [bodyData.email]
        })
        // ถ้าไม่พบ หรือรหัสผ่านไม่ตรง ตอบข้อความเดียวกัน (ไม่บอกว่าผิดที่ email หรือ password)
        if (result.rowCount == 0)
            return res.status(401).json({ message: `Login Fail`, login: false })

        const member = result.rows[0]
        // นำค่า hash จาก DB เทียบกับ password ที่ frontend ส่งมา โดยใช้ bcrypt
        const loginOK = await bcrypt.compare(bodyData.password, member.password_hash)
        if (!loginOK) {
            res.clearCookie('token', cookieOption)
            return res.status(401).json({ message: `Login Fail`, login: false })
        }
        // บัญชีถูกระงับ
        if (member.status != 'active')
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
            maxAge: 3600000 // 3,600,000 ms --> 60 minute --> 1hr
        })
        res.json({ message: "Login Success", login: true, token: token, member: theuser })
    }
    catch (err) {
        return res.status(500).json({ message: err.message, login: false })
    }
}

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

export async function getMember(req, res) {
    console.log(`GET /members/detail is requested.`)
    // req.user ถูกตั้งค่ามาจาก middleware readToken (อ่านจาก Cookie ที่ส่งมาจาก Browser)
    if (!req.user)
        return res.status(401).json({ message: `No member`, login: false })
    return res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        login: true
    })
}
