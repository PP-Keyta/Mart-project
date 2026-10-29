
<template>
    <!-- PRODUCTS -->
  <div class="crumb"><a @click="go('home')">POP MART</a> › สินค้า</div>
  <div class="pbanner"><div><h1>สินค้าทั้งหมด</h1><p>รวมฟิกเกอร์สุดน่ารักจาก POP MART ที่คุณไม่ควรพลาด</p></div><div style="font-size:90px">🐰</div></div>
  <div class="layout">
    <aside class="side">
      <h3>หมวดหมู่</h3>
      <button class="it" v-for="c in cats" :key="c.n" :class="{on:cat===c.n}" @click="cat=c.n">{{c.n}}</button>
      <h3>แบรนด์</h3>
      <label v-for="b in brands" :key="b"><input type="checkbox" :value="b" v-model="brandSel"> {{b}}</label>
    </aside>
    <div>
      <div class="bar"><b>เรียงตาม</b>
        <select v-model="sort"><option value="pop">ยอดนิยม</option><option value="asc">ราคาต่ำ → สูง</option><option value="desc">ราคาสูง → ต่ำ</option></select>
        <span class="sp"></span>
        <button class="tg" :class="{on:view==='grid'}" @click="view='grid'" aria-label="กริด">▦</button>
        <button class="tg" :class="{on:view==='list'}" @click="view='list'" aria-label="รายการ">☰</button></div>
      <div class="empty" v-if="!filtered.length">ไม่พบสินค้า ลองเปลี่ยนตัวกรองหรือคำค้นหา</div>
      <div class="grid" :class="view"><div class="card" v-for="p in filtered" :key="p.id">
        <div class="thumb" :style="{background:p.bg}" @click="open(p)">{{p.e}}<button class="heart" @click.stop="fav(p)">{{favs.includes(p.id)?'♥':'♡'}}</button></div>
        <div style="flex:1"><h4>{{p.name}}</h4><p class="price">฿ {{p.price}}</p>
        <button class="btn" @click="add(p)">เพิ่มใส่ตะกร้า</button></div></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cat = ref('ทั้งหมด')
const sort = ref('pop')
const view = ref('grid')
const brandSel = ref([])
const favs = ref([])

const cats = [
  {n:'ทั้งหมด'},{n:'Labubu'}, {n:'Molly'}, 
  {n:'Skullpanda'}, {n:'Dimoo'}, {n:'Crybaby'}
]
const brands = ['POP MART', 'Molly', 'Labubu']

const products = ref([
  {id:1, name:'LABUBU The Monsters', price:590, e:'🐰', bg:'#fde4d8', cat:'Labubu'},
  {id:2, name:'Molly Space', price:690, e:'🧑‍🚀', bg:'#e3efdc', cat:'Molly'},
  {id:3, name:'Skullpanda', price:650, e:'🐵', bg:'#fbdfe8', cat:'Skullpanda'},
  {id:4, name:'Dimoo Animal', price:550, e:'🧒', bg:'#dfeaf2', cat:'Dimoo'}
])

const filtered = computed(() => {
  let l = products.value.filter(p => (cat.value === 'ทั้งหมด' || p.cat === cat.value))
  if(sort.value === 'asc') l.sort((a,b) => a.price - b.price)
  if(sort.value === 'desc') l.sort((a,b) => b.price - a.price)
  return l
})

const go = (path) => router.push('/' + path)
const open = (p) => router.push('/prodetail/detail')
const add = (p) => router.push('/cart')
const fav = (p) => {
  const idx = favs.value.indexOf(p.id)
  if(idx > -1) favs.value.splice(idx, 1)
  else favs.value.push(p.id)
}
</script>