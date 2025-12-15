import {createApp} from 'vue'
import App from './App.vue'
import api from "@/plugins/api";
import router from "@/routes";
import {message} from 'ant-design-vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)

app.use(router)
app.use(Antd)
app.use(api, {message: message, router: router})

app.mount('#app')
