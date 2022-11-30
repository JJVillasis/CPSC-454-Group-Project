<template>
    <div>
      <h2>{{this.username}}</h2>
    </div>

  <div class="scrolling-component" ref="scrollComponent">
    <div class = "container">
      <div class ="row">
        <post-component v-for="post in posts" :post="post" v-bind:key="post"/>
      </div>
    </div>
  </div>

</template>

<script>
import CognitoAuth from './../cognito';
import axios from 'axios';
import PostComponent from './PostComponent.vue'
import config from '../config'
import getPosts from "../get-posts";
import { ref } from 'vue'
const scrollComponent = ref(null)

//var username = CognitoAuth.getCurrentUser().getUsername()

export default {
    // eslint-disable-next-line
    name: 'Profile',
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
      axios.get(this.getBackendUrl() + "/search?text=" + text + "&sortby=" + sortby + "&user="+username, {
        //We can add more configurations in this object
        params: {

          //This is one of the many options we can configure
        }
      }).then( response => {
            this.posts = getPosts(response.data, 0, 10);
            this.lastItem = 10
          }
      );
    },
    getNextData : function() {
      window.onscroll = () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
        if (bottomOfWindow) {
          axios.get(this.getBackendUrl() + "/search?text=" + this.text + "&sortby=" + this.sortBy + "&user="+this.username, {
            //We can add more configurations in this object
            params: {
              //This is one of the many options we can configure
            }
          }).then( response => {
            this.posts.push(...getPosts(response.data, this.lastItem, 10));
            this.lastItem += 10
          });
        }
      }
    }
  },
  beforeMount() {
    this.username = CognitoAuth.getCurrentUser() ? CognitoAuth.getCurrentUser().getUsername() : null;
    this.sortBy = "newest"
    this.getdata(undefined, this.sortBy, this.username);
  },
  mounted() {
    this.getNextData();
  }
}
</script>

<style scoped>
body {
  background-color: #F4f4F4;
}

.row {
  display: flex;
  justify-content: center;
  margin: auto 0;
}
</style>