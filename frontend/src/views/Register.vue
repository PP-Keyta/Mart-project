<template>
  <div style="max-width:450px; margin:40px auto; background:var(--card); padding:40px; border-radius:24px; border:1px solid var(--line); text-align:center">
    <h2 style="margin:0 0 10px 0">สร้างบัญชีผู้ใช้ใหม่</h2>
    <p style="color:var(--mute); margin-bottom: 24px;">เข้าร่วมเป็นสมาชิกเพื่อรับสิทธิพิเศษมากมาย</p>

    <form @submit.prevent="submit">
      <div class="form" style="grid-template-columns:1fr; text-align:left; margin-bottom:24px; gap:12px;">
        <div>
          <label style="margin-top:0">ชื่อผู้ใช้งาน</label>
          <input type="text" v-model="name" placeholder="ตั้งชื่อผู้ใช้งานของคุณ">
          <small v-if="errors.name" style="color:#c02a54">{{ errors.name }}</small>
        </div>
        <div>
          <label>อีเมล</label>
          <input type="email" v-model="email" placeholder="example@email.com">
          <small v-if="errors.email" style="color:#c02a54">{{ errors.email }}</small>
        </div>
        <div>
          <label>รหัสผ่าน</label>
          <input type="password" v-model="pw" placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร">
          <small v-if="errors.pw" style="color:#c02a54">{{ errors.pw }}</small>
        </div>
        <div>
          <label>ยืนยันรหัสผ่าน</label>
          <input type="password" v-model="pw2" placeholder="กรอกรหัสผ่านอีกครั้ง">
          <small v-if="errors.pw2" style="color:#c02a54">{{ errors.pw2 }}</small>
        </div>
      </div>

      <p v-if="errors.form" style="color:#c02a54; margin:0 0 12px 0">{{ errors.form }}</p>

      <button class="btn" type="submit" :disabled="loading" style="width:100%; padding:14px; font-size:16px;">
        {{ loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
      </button>
    </form>
    <p style="margin-top:20px; color:var(--mute)">มีบัญชีอยู่แล้ว? <router-link to="/login" style="color:var(--pink); font-weight:bold; text-decoration:none;">เข้าสู่ระบบที่นี่</router-link></p>
  </div>
  <div class="toast" v-if="msg">{{ msg }}</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { callApi } from '../api.js'

const router = useRouter()

// ตัวแปรเก็บข้อมูลฟอร์มและสถานะต่างๆ
const name = ref('')
const email = ref('')
const pw = ref('')
const pw2 = ref('')
const loading = ref(false)
const msg = ref('')
const errors = reactive({ name: '', email: '', pw: '', pw2: '', form: '' })

// ฟังก์ชันแสดงข้อความแจ้งเตือน (Toast)
let t
const toast = (m) => {
  msg.value = m
  clearTimeout(t)
  t = setTimeout(() => msg.value = '', 2400)
}

// ตรวจสอบฟอร์ม (กติกาต้องตรงกับ Backend: อีเมลถูกรูปแบบ, รหัสผ่านอย่างน้อย 8 ตัว)
const validate = () => {
  errors.name = name.value.trim() ? '' : 'กรอกชื่อผู้ใช้งาน'
  errors.email = !email.value ? 'กรอกอีเมล'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'รูปแบบอีเมลไม่ถูกต้อง'
  errors.pw = !pw.value ? 'กรอกรหัสผ่าน' : pw.value.length < 8 ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : ''
  errors.pw2 = pw2.value === pw.value ? '' : 'รหัสผ่านไม่ตรงกัน'
  return !(errors.name || errors.email || errors.pw || errors.pw2)
}

// ฟังก์ชันเมื่อกดปุ่มสมัครสมาชิก
const submit = async () => {
  errors.form = ''
  if (!validate()) return

  loading.value = true
  try {
    // POST /api/members
    const data = await callApi('/api/members', 'POST', {
      name: name.value.trim(),
      email: email.value,
      password: pw.value
    })
    if (!data.regist) {
      errors.form = data.message
      return
    }
    toast('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ')
    setTimeout(() => {
      router.push('/login')
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