<template>
    <div>
        <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-success ml-2">
                <router-link class="nav-link" to="upload">+ New Post</router-link>
            </button>
            <div class="btn-group btn-group-toggle my-2"  data-toggle="buttons">
                <label class="btn btn-secondary btn-warning">
                    <input type="radio" name="options" id="viral" v-on:click="changeSelection($event)" autocomplete="off"> Most Viral ↓
                </label>
                <label class="btn btn-secondary btn-warning">
                    <input type="radio" name="options" id="newest" v-on:click="changeSelection($event)" autocomplete="off"> Newest ↓
                </label>
                <label class="btn btn-secondary btn-warning mr-3">
                    <input type="radio" name="options" id="controversial" v-on:click="changeSelection($event)" autocomplete="off"> Controversial ↓
                </label>
            </div>
        </div>
        <div class="scrolling-component" ref="scrollComponent">
        <div class = "container">
        <div class ="row">
            <post-component v-for="post in posts" :post="post" v-bind:key="post"/>
        </div>
    </div>
    </div>
    </div>
</template>

<script>
import axios from 'axios';
import PostComponent from './PostComponent.vue'
import config from '../config'
import getPosts from "../get-posts";
import { ref } from 'vue'
import CognitoAuth from "../cognito";
const scrollComponent = ref(null)

export default {
    name: 'HomePage',
    components: {
        PostComponent
    },
    data() {
        return {
            posts: [],
            lastItem: 0,
            text: null,
            sortBy: null,
            username: null
        }
    },
    setup() {
      return {
          scrollComponent
      }
    },
    methods: {
        changeSelection: function(event) {
            console.log("Clicked " + event.target.id);
            this.getdata(null, event.target.id)
        },
        getBackendUrl : function() {
          return config.prod ? config.backendProd : config.backendLocal;
        },
        getdata: function(text, sortby, username) {
          this.text = text;
          this.sortBy = sortby;
          this.username = username;
          let currentUsername;
          if (CognitoAuth.getCurrentUser() != null)
            currentUsername = CognitoAuth.getCurrentUser().getUsername();
          axios.get(this.getBackendUrl() + "/search?text=" + text + "&sortby=" + sortby + "&user="+username+ "&currentuser="+currentUsername, {
            //We can add more configurations in this object
            params: {

              //This is one of the many options we can configure
            }
          }).then( response => {
                this.posts = getPosts(response.data, 0, 5);
                this.lastItem = 5
              }
          );
        },
        getNextData : function() {
          window.onscroll = () => {
            let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
            if (bottomOfWindow) {
              //let currentUsername = CognitoAuth.getCurrentUser().getUsername();
              /*axios.get(this.getBackendUrl() + "/search?text=" + this.text + "&sortby=" + this.sortBy + "&user="+this.username+ "&currentuser="+currentUsername, {
                //We can add more configurations in this object
                params: {
                  //This is one of the many options we can configure
                }
              }).then( response => {*/
                    this.posts.push(...getPosts(null, /*response.data,*/ this.lastItem, 5));
                    this.lastItem += 5
              //});
            }
          }
        }
    },
    beforeMount() {
      this.getdata();
    },
    mounted() {
        this.getNextData();
    }
}
</script>

<style>
body {
    background-color: #F4f4F4;
}
</style>