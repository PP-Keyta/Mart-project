<template>
  <header>
    <div class="wrap nav">
      <!-- โลโก้ -->
      <span class="logo" @click="$router.push('/')">KOP MART</span>
      
      <!-- เมนู -->
      <router-link to="/" active-class="on">หน้าแรก</router-link>
      <router-link to="/products" active-class="on">สินค้า</router-link>
      
      <!-- ช่องค้นหา -->
      <div class="search">
        🔍<input type="text" placeholder="ค้นหาสินค้า / คอลเล็กชัน...">
      </div>
      
      <!-- ไอคอนโปรไฟล์ และ ตะกร้า -->
      <button class="ib" @click="handleProfileClick" aria-label="บัญชี">👤</button>
      <button class="ib" @click="$router.push('/cart')" aria-label="ตะกร้า">
        🛒<span class="badge">3</span>
      </button>
    </div>
  </header>
  
  <main class="wrap">
    <!-- จุดแสดงผลเนื้อหาแต่ละหน้า -->
    <router-view></router-view>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// ฟังก์ชันตรวจสอบก่อนไปหน้าโปรไฟล์
const handleProfileClick = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (isLoggedIn === 'true') {
    router.push('/profile')
  } else {
    router.push('/login')
  }
}
</script>