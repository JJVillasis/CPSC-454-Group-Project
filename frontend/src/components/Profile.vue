<template>
    <div>
        <h2>Profile Placeholder</h2>
      Put other profile stuff here.

      Images uploaded by this user are below:
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
            this.posts = getPosts(response.data, 0, 5);
            this.lastItem = 5
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
            this.posts.push(...getPosts(response.data, this.lastItem, 5));
            this.lastItem += 5
          });
        }
      }
    }
  },
  beforeMount() {
    this.username = CognitoAuth.getCurrentUser().getUsername();
    this.sortBy = "newest"
    this.getdata();
  },
  mounted() {
    this.getNextData();
  }
}
</script>

<style scoped>

</style>