<template>
  <div style="max-width:450px; margin:40px auto; background:var(--card); padding:40px; border-radius:24px; border:1px solid var(--line); text-align:center">
    <h2 style="margin:0 0 10px 0">สร้างบัญชีผู้ใช้ใหม่</h2>
    <p style="color:var(--mute); margin-bottom: 24px;">เข้าร่วมเป็นสมาชิกเพื่อรับสิทธิพิเศษมากมาย</p>
    
    <div class="form" style="grid-template-columns:1fr; text-align:left; margin-bottom:24px; gap:12px;">
      <div>
        <label style="margin-top:0">ชื่อผู้ใช้งาน</label>
        <input type="text" placeholder="ตั้งชื่อผู้ใช้งานของคุณ">
      </div>
      <div>
        <label>อีเมล</label>
        <input type="email" placeholder="example@email.com">
      </div>
      <div>
        <label>รหัสผ่าน</label>
        <input type="password" placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร">
      </div>
      <div>
        <label>ยืนยันรหัสผ่าน</label>
        <input type="password" placeholder="กรอกรหัสผ่านอีกครั้ง">
      </div>
    </div>
    
    <button class="btn" style="width:100%; padding:14px; font-size:16px;" @click="$router.push('/login')">สมัครสมาชิก</button>
    <p style="margin-top:20px; color:var(--mute)">มีบัญชีอยู่แล้ว? <router-link to="/login" style="color:var(--pink); font-weight:bold; text-decoration:none;">เข้าสู่ระบบที่นี่</router-link></p>
  </div>
</template>
