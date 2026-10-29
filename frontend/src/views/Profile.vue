<template>
    <!-- PROFILE -->
  <div class="profile">
    <aside class="pside"><div class="av">🐰</div><h3 style="margin:4px 0">{{user.nick}}</h3><div style="color:var(--mute);margin-bottom:20px">{{user.email}}</div>
      <button class="it" v-for="m in menu" :key="m" :class="{on:m===menuSel}" @click="menuSel=m">{{m}}</button>
      <button class="it" style="background:var(--card);text-align:center;font-weight:700;margin-top:30px" @click="logout">ออกจากระบบ</button></aside>
    <div>
      <div class="pmain"><h2 style="margin-top:0">ข้อมูลส่วนตัว</h2>
        <div class="form"><div>
          <label>ชื่อ-นามสกุล</label><input v-model="user.name" :disabled="!edit">
          <label>อีเมล</label><input v-model="user.email" type="email" :disabled="!edit">
          <label>เบอร์โทรศัพท์</label><input v-model="user.phone" :disabled="!edit">
          <p><button class="btn" @click="edit=!edit; if(!edit) toast('บันทึกข้อมูลแล้ว')">{{edit?'บันทึกข้อมูล':'แก้ไขข้อมูล'}}</button></p></div>
          <div class="pic"><div class="av">🐰</div><b>เปลี่ยนรูปโปรไฟล์</b></div></div></div>
      <h2>ที่อยู่จัดส่ง</h2>
      <div class="addr"><div><span>👤 {{user.addr}}</span><button class="btn ghost" style="padding:6px 14px">แก้ไข</button></div>
        <div style="justify-content:center;cursor:pointer" @click="toast('เพิ่มที่อยู่ใหม่ (เดโม)')">＋ เพิ่มที่อยู่ใหม่</div></div>
      <h2>ประวัติการสั่งซื้อ</h2>
      <div style="overflow-x:auto"><table><tr><th>เลขที่คำสั่งซื้อ</th><th>วันที่สั่งซื้อ</th><th>ยอดรวม</th><th>สถานะ</th></tr>
        <tr v-for="o in orders" :key="o.id"><td>{{o.id}}</td><td>{{o.date}}</td><td>฿ {{fmt(o.total)}}</td><td><span class="st" :class="o.cls">{{o.st}}</span></td></tr></table></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('isLoggedIn') // ลบสถานะการล็อคอิน
  alert('ออกจากระบบแล้ว')
  router.push('/login') // เด้งไปหน้าเข้าสู่ระบบ
}

const edit = ref(false)
const menuSel = ref('ข้อมูลส่วนตัว')
const menu = ['ข้อมูลส่วนตัว','ที่อยู่จัดส่ง','ประวัติการสั่งซื้อ','รายการโปรด']

const user = ref({
  nick: 'Chanopho', name: 'ชนกพร อยู่แก้ว', email: 'chanopho@example.com', 
  phone: '081-234-5678', addr: '123/45 หมู่บ้านพฤกษา...'
})

const orders = ref([
  { id: '#PMT2025003', date: '12 ก.ค. 2569', total: 1860, st: 'จัดส่งแล้ว', cls: 'ok' },
  { id: '#PMT2025002', date: '5 ก.ค. 2569', total: 690, st: 'รอจัดส่ง', cls: 'wait' },
  { id: '#PMT2025001', date: '28 มิ.ย. 2569', total: 1250, st: 'ยกเลิก', cls: 'no' }
])

const fmt = (n) => n.toLocaleString('en-US')
const toast = (msg) => alert(msg)
</script>