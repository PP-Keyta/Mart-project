import express from "express"
import * as memberC from "../controllers/memberController.js"

const router = express.Router()

router.get('/members/detail', memberC.getMember)      // ทำงานเมื่อได้รับ GET Request /members/detail
router.get('/members/logout', memberC.logoutMember)   // ทำงานเมื่อได้รับ GET Request /members/logout
router.post('/members', memberC.postMember)           // ทำงานเมื่อได้รับ POST Request /members
router.post('/members/login', memberC.loginMember)    // ทำงานเมื่อได้รับ POST Request /members/login

export default router
