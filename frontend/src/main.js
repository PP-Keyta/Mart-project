import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // ไฟล์ที่คุณเขียนด้านบน
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')