<template>
    <!-- DETAIL -->
  <div class="crumb"><a @click="go('home')">หน้าแรก</a> › <a @click="go('products')">สินค้า</a> › {{cur.name}}</div>
  <div class="detail">
    <div class="main" :style="{background:cur.bg}">{{cur.e}}</div>
    <div>
      <h1 style="margin:0">{{cur.name}}</h1><p>POP MART</p>
      <div><span class="big">฿ {{cur.price}}</span><span class="old">฿ {{cur.old}}</span><span class="tag">ลด {{discount}}%</span></div>
      <p>⭐⭐⭐⭐☆ 4.5 รีวิว (256 ราย)</p>
      <p>ฟิกเกอร์ยอดฮิตจากซีรีส์ The Monsters ดีไซน์น่ารัก มีให้หลายรูปแบบ เหมาะสำหรับนักสะสม ทุกเพศทุกวัย</p>
      <div style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap"><div><div>จำนวน</div>
        <div class="qty"><button @click="dq=Math.max(1,dq-1)">−</button><span>{{dq}}</span><button @click="dq++">+</button></div></div>
        <div style="flex:1;min-width:200px;display:grid;gap:10px">
          <button class="btn" @click="add(cur,dq)">★ เพิ่มใส่ตะกร้า</button>
          <button class="btn ghost" @click="add(cur,dq,true)">ซื้อเลย</button></div></div>
      <div class="perks"><div>🚚 รอจัดส่งฟรี<br>เมื่อซื้อครบ 1,000 บาท</div><div>🛡️ ได้ของแท้ 100%</div><div>🔄 เปลี่ยน/คืนสินค้า<br>ภายใน 7 วัน</div></div>
      <div class="tabs"><button v-for="t in tabs" :key="t.k" :class="{on:tab===t.k}" @click="tab=t.k">{{t.n}}</button></div>
      <div class="tabbody">
        <div v-if="tab==='d'">{{cur.name}} ซีรีส์ยอดฮิตจาก POP MART ด้วยคาแรคเตอร์ที่น่ารักและลวดลายที่เป็นเอกลักษณ์ เหมาะสำหรับนักสะสม<br>• ขนาด: ประมาณ 17 cm<br>• วัสดุ: PVC / ABS<br>• เหมาะสำหรับ: อายุ 15 ปีขึ้นไป</div>
        <div v-if="tab==='r'">ลูกค้าให้คะแนนเฉลี่ย 4.5 จาก 5 (256 รีวิว) — ของแท้ แพ็กเกจดี ส่งไว</div>
        <div v-if="tab==='s'">จัดส่งภายใน 2–3 วันทำการ ค่าจัดส่ง ฿50 ส่งฟรีเมื่อซื้อครบ ฿1,000</div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const img = ref(1)
const dq = ref(1)
const tab = ref('d')

const cur = ref({
  id: 1, name: 'LABUBU The Monsters', price: 590, old: 690, e:'🐰', bg:'#fde4d8'
})

const tabs = [
  {k:'d', n:'รายละเอียดสินค้า'}, {k:'r', n:'รีวิว (256)'}, {k:'s', n:'ข้อมูลการจัดส่ง'}
]

const discount = computed(() => Math.round((1 - cur.value.price / cur.value.old) * 100))
const go = (path) => router.push('/' + path)
const add = (p, qty, buy = false) => {
  if(buy) router.push('/cart')
  else alert('เพิ่มลงตะกร้าแล้ว')
}
</script>