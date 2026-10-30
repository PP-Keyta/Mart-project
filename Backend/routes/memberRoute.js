import express from "express"
import * as memberC from "../controllers/memberController.js"

const router = express.Router()

router.get('/members/detail', memberC.getMember)      // ทำงานเมื่อได้รับ GET Request /members/detail
router.get('/members/logout', memberC.logoutMember)   // ทำงานเมื่อได้รับ GET Request /members/logout
router.post('/members', memberC.postMember)           // ทำงานเมื่อได้รับ POST Request /members
router.post('/members/login', memberC.loginMember)    // ทำงานเมื่อได้รับ POST Request /members/login
router.put('/members', memberC.putMember)             // ทำงานเมื่อได้รับ PUT Request /members (แก้ไขข้อมูลส่วนตัว)
router.post('/members/uploadimg', memberC.uploadMember) // ทำงานเมื่อได้รับ POST Request /members/uploadimg

// เฉพาะ Admin (ตรวจสิทธิ์ในแต่ละฟังก์ชัน)
router.get('/members', memberC.getAllMember)                  // รายชื่อสมาชิกทั้งหมด
router.put('/members/:id/status', memberC.putMemberStatus)    // เปลี่ยนสถานะ
router.put('/members/:id/role', memberC.putMemberRole)        // เปลี่ยนบทบาท (เพิ่ม admin)

export default router