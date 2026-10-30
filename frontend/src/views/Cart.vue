<template>
    <!-- CART -->
  <div class="cartgrid">
    <div><h2 style="margin:0 0 12px">ตะกร้าสินค้า <small style="font-weight:400;color:var(--mute)">({{cart.length}} รายการ)</small></h2>
      <div class="cartbox">
        <div class="empty" v-if="!cart.length">ตะกร้ายังว่าง เลือกสินค้าที่ถูกใจได้เลย</div>
        <div style="overflow-x:auto" v-else>
          <table>
          <tr><th>สินค้า</th><th>ราคา</th><th>จำนวน</th><th>ราคารวม</th><th>ลบ</th></tr>
          <tr><td colspan="5"><label style="color:var(--pink);cursor:pointer">
            <input type="checkbox" :checked="allSel" @change="toggleAll($event.target.checked)"> เลือกทั้งหมด</label></td></tr>
          <tr v-for="it in cart" :key="it.id">
            <td>
              <div style="display:flex;gap:12px;align-items:center">
                <input type="checkbox" v-model="it.sel">
                <div class="mini">
                  <img :src="`http://localhost:3000/img_pd/${it.code}.jpg`" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" alt=""></div>{{it.name}}</div></td>
            <td style="white-space: nowrap;">฿ {{it.price}}</td>
            <td><div class="qty">
              <button @click="it.qty=Math.max(1,it.qty-1)">−</button>
              <span>{{it.qty}}</span>
              <button @click="it.qty++">+</button></div></td>
            <td style="white-space: nowrap;">฿ {{it.price*it.qty}}</td>
            <td><button class="ib" style="font-size:18px" @click="remove(it.id)" aria-label="ลบ">🗑️</button></td></tr>
        </table></div>
        <div style="padding:12px">
          <button class="btn" @click="go('products')">← เลือกซื้อสินค้าต่อ</button></div>
      </div></div>
    <div class="sum"><div class="h">สรุปคำสั่งซื้อ</div><div class="b">
      <div class="r"><span>ราคารวมสินค้า ({{selQty}} ชิ้น)</span><span>฿ {{fmt(subtotal)}}</span></div>
      <div class="r"><span>ค่าจัดส่ง</span><span>฿ {{shipping}}</span></div>
      <div class="t"><span>ยอดรวมทั้งหมด</span><span>฿ {{fmt(subtotal+shipping)}}</span></div>
      <button class="btn" :disabled="!selQty" :style="{opacity:selQty?1:.5}" @click="order">สั่งซื้อสินค้า</button>
      <div class="r" style="margin-top:14px">🚚 จัดส่งฟรี เมื่อซื้อครบ 1,000.-</div></div></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const cart = ref([])

axios.defaults.withCredentials = true

const fetchCart = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/cart')
    if (res.data && res.data.items) {
      // นำข้อมูลจาก Backend มาปรับโครงสร้างให้เข้ากับหน้าจอ
      cart.value = res.data.items.map(item => ({
        id: item.item_id, // ใช้ id ของ order_items สำหรับอ้างอิงเวลาลบ
        product_id: item.product_id,
        code: item.code,
        name: item.name,
        price: Number(item.unit_price),
        qty: item.qty,
        sel: true // เลือกสินค้าทุกชิ้นอัตโนมัติ
      }))
    }
  } catch (error) {
    if (error.response?.status === 401) {
      alert('กรุณาเข้าสู่ระบบก่อนดูตะกร้าสินค้า')
      router.push('/login')
    } else {
      console.error('ไม่สามารถโหลดตะกร้าได้:', error)
    }
  }
}

onMounted(() => {
  fetchCart()
})

watch(cart, (newCart) => {
  localStorage.setItem('kop_cart', JSON.stringify(newCart))
  window.dispatchEvent(new Event('cart-updated'))
}, { deep: true })

const allSel = computed(() => cart.value.length > 0 && cart.value.every(i => i.sel))
const sel = computed(() => cart.value.filter(i => i.sel))
const selQty = computed(() => sel.value.reduce((s,i) => s + i.qty, 0))
const subtotal = computed(() => sel.value.reduce((s,i) => s + i.qty * i.price, 0))
const shipping = computed(() => !selQty.value || subtotal.value >= 1000 ? 0 : 50)

const fmt = (n) => n.toLocaleString('en-US')
const go = (path) => router.push('/' + path)
const remove = (id) => {
  const i = cart.value.findIndex(x => x.id === id)
  if(i > -1) cart.value.splice(i, 1)
}
const toggleAll = (val) => cart.value.forEach(i => i.sel = val)
const order = () => {
  alert("สั่งซื้อสำเร็จ!")
  router.push('/profile')
}
</script>
