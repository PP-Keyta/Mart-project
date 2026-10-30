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
        <input type="text" v-model="searchQuery" @keyup.enter="handleSearch" placeholder="ค้นหาสินค้า / คอลเล็กชัน...">
        🔍
      </div>
      
      <!-- ไอคอนโปรไฟล์ และ ตะกร้า -->
      <button class="ib" @click="handleProfileClick" aria-label="บัญชี">👤</button>
      <button class="ib" @click="$router.push('/cart')" aria-label="ตะกร้า">
        🛒<span class="badge" v-if="cartCount > 0">{{ cartCount }}</span>
      </button>
    </div>
  </header>
  
  <main class="wrap">
    <!-- จุดแสดงผลเนื้อหาแต่ละหน้า -->
    <router-view></router-view>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartCount = ref(0) // ตัวแปรเก็บจำนวนสินค้าในตะกร้า
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // ถ้ามีการพิมพ์คำค้นหา ให้พาไปหน้าสินค้าและแนบคำค้นหาไปที่ URL
    router.push({ path: '/products', query: { q: searchQuery.value } })
  } else {
    // ถ้าช่องว่างเปล่า ให้ไปหน้าสินค้าแบบแสดงทั้งหมด
    router.push('/products')
  }
}

// ฟังก์ชันดึงจำนวนสินค้าจาก localStorage
const updateCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('kop_cart') || '[]')
  // รวมจำนวนชิ้น (qty) ของสินค้าทุกรายการในตะกร้า
  cartCount.value = cart.reduce((sum, item) => sum + item.qty, 0)
}

onMounted(() => {
  updateCartCount()
  // ดักจับ Event เมื่อมีการเพิ่ม/ลบ สินค้า
  window.addEventListener('cart-updated', updateCartCount)
})

onUnmounted(() => {
  window.removeEventListener('cart-updated', updateCartCount)
})

// ฟังก์ชันกดปุ่มโปรไฟล์ (ที่คุณเคยทำไว้)
const handleProfileClick = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (isLoggedIn === 'true') {
    router.push('/profile')
  } else {
    router.push('/login')
  }
}
</script>