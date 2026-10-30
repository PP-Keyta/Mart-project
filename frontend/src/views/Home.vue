<template>
    <!-- HOME -->
  <div class="hero"><div>
    <span class="logo" style="display:inline-block;cursor:default">KOP MART</span>
    <h1>Small Figures<br>Big Happiness</h1>
    <p>ของสะสมสุดพิเศษ ที่ทำให้ทุกวันมีรอยยิ้ม</p>
    <button class="btn" @click="go('products')">ช้อปเลย →</button></div>
    <div class="fig">🐰</div></div>
  <div class="cats">
    <button class="cat" v-for="c in cats" :key="c.n" @click="pickCat(c.n)"><div class="ic">{{c.e}}</div>{{c.n}}</button>
  </div>
  <div class="sec"><h2>สินค้าขายดี</h2><a @click="go('products')">ดูทั้งหมด →</a></div>
  <div class="grid"><div class="card" v-for="p in products.slice(0,4)" :key="p.id">
    <div class="thumb" :style="{background:p.bg}" @click="open(p)">{{p.e}}<button class="heart" @click.stop="fav(p)">{{favs.includes(p.id)?'♥':'♡'}}</button></div>
    <h4>{{p.name}}</h4><p class="price">฿ {{p.price}}</p>
    <button class="btn" @click="add(p)">เพิ่มในตะกร้า</button></div></div>
  <div class="promo"><div><small>คอลเล็กชันใหม่ล่าสุด</small><h2 style="margin:4px 0">ไปกับ POP MART</h2>
    <p>สินค้าลิขสิทธิ์แท้ น่ารักแบบไม่มีที่สิ้นสุด!</p><button class="btn green" @click="go('products')">ดูเพิ่มเติม →</button></div>
    <div style="font-size:70px">🎁🐰</div></div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const favs = ref([])

const cats = [
  {n:'ทั้งหมด', e:'🧸'}, {n:'Labubu', e:'🐰'}, {n:'Molly', e:'🧑‍🚀'}, 
  {n:'Skullpanda', e:'🐵'}, {n:'Dimoo', e:'🧒'}
];

const products = ref([
  {id:1, name:'LABUBU The Monsters', price:590, e:'🐰', bg:'#fde4d8'},
  {id:2, name:'Molly Space', price:690, e:'🧑‍🚀', bg:'#e3efdc'},
  {id:3, name:'Skullpanda', price:650, e:'🐵', bg:'#fbdfe8'},
  {id:4, name:'Dimoo Animal', price:550, e:'🧒', bg:'#dfeaf2'}
])

const go = (path) => router.push('/' + path)
const pickCat = (cat) => router.push('/products')
const open = (p) => router.push('/prodetail/detail')
const add = (p) => router.push('/cart')
const fav = (p) => {
  const idx = favs.value.indexOf(p.id)
  if(idx > -1) favs.value.splice(idx, 1)
  else favs.value.push(p.id)
}
</script>