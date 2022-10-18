/*import Vue from 'vue'
import Router from 'vue-router'
import HomePage from './../components/HomePage.vue'

Vue.use(Router)

export default new Router({
    routes: [
      { path: '/', component: HomePage },
    ]
})
*/

import { createWebHistory, createRouter } from "vue-router";
import Home from "@/components/HomePage.vue";
import LogIn from '../components/LogIn.vue'
import Register from '../components/Register.vue'
import Profile from '../components/Profile.vue'
import Single from './../components/Single.vue'

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  { path: '/login', name: "Login", component: LogIn },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { path: '/:id', component: Single },


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
