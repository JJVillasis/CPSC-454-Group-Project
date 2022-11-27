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
import Upload from './../components/Upload.vue'
import Confirm from './../components/Confirm.vue'
import cognitoAuth from '@/cognito'


function requireAuth (to, from, next) {
  cognitoAuth.isAuthenticated((err, loggedIn) => {
    if (err) return next()
    if (!loggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  })
}

function logout(to, from, next) {
  cognitoAuth.logout()
  next('/')
}

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  { path: '/login', name: "Login", component: LogIn },
  { path: '/register', component: Register },
  { path: '/confirm', component: Confirm },
  { path: '/profile', component: Profile },
  { path: '/:id', component: Single },
  { path: '/upload', component: Upload, beforeEnter: requireAuth },

  { path: '/logout', beforeEnter: logout },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
