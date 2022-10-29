import { createApp } from 'vue'
import cognitoAuth from './cognito'
import App from './App.vue'
import router from './router' // <---
import config from './config'

createApp(App).use(router).use(cognitoAuth, config).mount('#app')

