<template>
  <div style="max-width:400px; margin:60px auto; background:var(--card); padding:40px; border-radius:24px; border:1px solid var(--line); text-align:center">
    <h2 style="margin:0 0 10px 0">เข้าสู่ระบบ</h2>
    <p style="color:var(--mute); margin-bottom: 24px;">ยินดีต้อนรับกลับสู่ KOP MART</p>
    
    <div class="form" style="grid-template-columns:1fr; text-align:left; margin-bottom:24px; gap:16px;">
      <div>
        <label style="margin-top:0">อีเมล</label>
        <input type="email" placeholder="example@email.com">
      </div>
      <div>
        <label>รหัสผ่าน</label>
        <input type="password" placeholder="••••••••">
      </div>
    </div>
    
    <button class="btn" style="width:100%; padding:14px; font-size:16px;" @click="$router.push('/profile')">เข้าสู่ระบบ</button>
    <p style="margin-top:20px; color:var(--mute)">ยังไม่มีบัญชี? <router-link to="/register" style="color:var(--pink); font-weight:bold; text-decoration:none;">สมัครสมาชิก</router-link></p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

// เรียกใช้งาน Router สำหรับเปลี่ยนหน้า
const router = useRouter()

// ตัวแปรเก็บข้อมูลฟอร์มและสถานะต่างๆ
const id = ref('')
const pw = ref('')
const show = ref(false)
const remember = ref(true)
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

// ฟังก์ชันตรวจสอบความถูกต้องของอีเมล/เบอร์โทร และรหัสผ่าน
const validate = (f) => {
  if (f === 'id') {
    const v = id.value
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    const phone = /^0\d{8,9}$/.test(v.replace(/[-\s]/g, ''))
    errors.id = !v ? 'กรอกอีเมลหรือเบอร์โทรศัพท์' : (email || phone) ? '' : 'รูปแบบอีเมลหรือเบอร์โทรไม่ถูกต้อง'
  } else {
    errors.pw = !pw.value ? 'กรอกรหัสผ่าน' : pw.value.length < 6 ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : ''
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

  // เปิดสถานะกำลังโหลด
  loading.value = true
  
  // จำลองการเรียก API ใช้เวลา 0.9 วินาที
  await new Promise(r => setTimeout(r, 900))
  loading.value = false

  // จำลองการตรวจสอบรหัสผ่านผิด (ถ้าพิมพ์รหัสว่า wrong123 จะแจ้งเตือน)
  if (pw.value === 'wrong123') {
    errors.form = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง ลองอีกครั้ง'
    return
  }

  // **ส่วนสำคัญ: บันทึกสถานะการล็อคอินลงในเบราว์เซอร์**
  localStorage.setItem('isLoggedIn', 'true')
  toast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับมา!')

  // ดีเลย์ 1.5 วินาทีเพื่อให้ผู้ใช้เห็นข้อความสำเร็จ แล้วเปลี่ยนไปหน้า Profile
  setTimeout(() => {
    router.push('/profile')
  }, 1500)
}

// ฟังก์ชันจำลองปุ่ม Social Login
const social = (n) => {
  toast('เข้าสู่ระบบด้วย ' + n + ' (เดโม)')
}
</script>