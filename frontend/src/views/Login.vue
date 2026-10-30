<template>
  <div style="max-width:400px; margin:60px auto; background:var(--card); padding:40px; border-radius:24px; border:1px solid var(--line); text-align:center">
    <h2 style="margin:0 0 10px 0">เข้าสู่ระบบ</h2>
    <p style="color:var(--mute); margin-bottom: 24px;">ยินดีต้อนรับกลับสู่ KOP MART</p>

    <form @submit.prevent="submit">
      <div class="form" style="grid-template-columns:1fr; text-align:left; margin-bottom:24px; gap:16px;">
        <div>
          <label style="margin-top:0">อีเมล</label>
          <input type="email" v-model="id" placeholder="example@email.com" @blur="validate('id')">
          <small v-if="errors.id" style="color:#c02a54">{{ errors.id }}</small>
        </div>
        <div>
          <label>รหัสผ่าน</label>
          <input type="password" v-model="pw" placeholder="••••••••" @blur="validate('pw')">
          <small v-if="errors.pw" style="color:#c02a54">{{ errors.pw }}</small>
        </div>
      </div>

      <p v-if="errors.form" style="color:#c02a54; margin:0 0 12px 0">{{ errors.form }}</p>

      <button class="btn" type="submit" :disabled="loading" style="width:100%; padding:14px; font-size:16px;">
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>
    </form>
    <p style="margin-top:20px; color:var(--mute)">ยังไม่มีบัญชี? <router-link to="/register" style="color:var(--pink); font-weight:bold; text-decoration:none;">สมัครสมาชิก</router-link></p>
  </div>
  <div class="toast" v-if="msg">{{ msg }}</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { callApi } from '../api.js'

// เรียกใช้งาน Router สำหรับเปลี่ยนหน้า
const router = useRouter()

// ตัวแปรเก็บข้อมูลฟอร์มและสถานะต่างๆ
const id = ref('')
const pw = ref('')
const loading = ref(false)
const msg = ref('')

// ตัวแปรเก็บข้อความแจ้งเตือนเมื่อกรอกผิด
const errors = reactive({ id: '', pw: '', form: '' })

// ฟังก์ชันแสดงข้อความแจ้งเตือน (Toast)
let t
const toast = (m) => {
  msg.value = m
  clearTimeout(t)
  t = setTimeout(() => msg.value = '', 2400)
}

// ฟังก์ชันตรวจสอบความถูกต้องของอีเมล และรหัสผ่าน (Backend รองรับการ login ด้วยอีเมล)
const validate = (f) => {
  if (f === 'id') {
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id.value)
    errors.id = !id.value ? 'กรอกอีเมล' : email ? '' : 'รูปแบบอีเมลไม่ถูกต้อง'
  } else {
    errors.pw = !pw.value ? 'กรอกรหัสผ่าน' : ''
  }
  return !errors[f]
}

// ฟังก์ชันเมื่อกดปุ่มเข้าสู่ระบบ
const submit = async () => {
  errors.form = ''

  // ตรวจสอบฟอร์มก่อนส่ง
  const a = validate('id')
  const b = validate('pw')
  if (!a || !b) return

  loading.value = true
  try {
    // POST /api/members/login --> Backend ตั้ง Cookie token ให้เอง
    const data = await callApi('/api/members/login', 'POST', { email: id.value, password: pw.value })
    if (!data.login) {
      errors.form = data.message === 'Login Fail'
        ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง ลองอีกครั้ง'
        : data.message
      return
    }

    // App.vue / Profile.vue ยังใช้ค่านี้ตรวจสถานะ จึงเก็บไว้ก่อน (token จริงอยู่ใน Cookie)
    localStorage.setItem('isLoggedIn', 'true')
    toast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับมา!')

    // ดีเลย์ 1.5 วินาทีเพื่อให้ผู้ใช้เห็นข้อความสำเร็จ แล้วเปลี่ยนไปหน้า Profile
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  }
  catch (err) {
    // เชื่อมต่อ Backend ไม่ได้
    errors.form = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
  }
  finally {
    loading.value = false
  }
}
</script>
