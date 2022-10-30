<template>
    <div>
        <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-success ml-2">
                <router-link class="nav-link" to="upload">+ New Post</router-link>
            </button>
            <div class="btn-group btn-group-toggle my-2"  data-toggle="buttons">
                <label class="btn btn-secondary btn-warning">
                    <input type="radio" name="options" id="option1" v-on:click="changeSelection($event)" autocomplete="off"> Most Viral ↓
                </label>
                <label class="btn btn-secondary btn-warning">
                    <input type="radio" name="options" id="option2" v-on:click="changeSelection($event)" autocomplete="off"> Newest ↓
                </label>
                <label class="btn btn-secondary btn-warning mr-3">
                    <input type="radio" name="options" id="option3" v-on:click="changeSelection($event)" autocomplete="off"> Controversial ↓
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
import getPosts from "../get-posts";
import { ref, onMounted, onUnmounted} from 'vue'
const posts = ref(getPosts(10))
const scrollComponent = ref(null)


export default {
    name: 'HomePage',
    components: {
        PostComponent
    },
    data() {
        return {
            posts,
        }
    },
    setup() {
        const loadMorePosts = () => {
        let newPosts = getPosts(20)
         console.log(newPosts)
        posts.value.push(...newPosts)
 }
        onMounted(() => {
            window.addEventListener("scroll", handleScroll)
        })
        onUnmounted(() => {
            window.removeEventListener("scroll", handleScroll)
        })
        const handleScroll = () => {
            let element = scrollComponent.value
    if (element.getBoundingClientRect().bottom < window.innerHeight) {
         loadMorePosts()
        }
    }
    return {
        scrollComponent
    }
    },
    async mounted() {
      await axios.get("http://localhost:3000/listall", {
//We can add more configurations in this object
        params: {

          //This is one of the many options we can configure
        }
      }).then( response =>
          this.latest = response.data
      );
    },
    async mounted() {
      await axios.get("http://localhost:3000/listall", {
//We can add more configurations in this object
        params: {

          //This is one of the many options we can configure
        }
      }).then( response =>
          this.latest = response.data
      );
    },
    methods: {
        changeSelection: function(event)
        {
            let element = event.target
            console.log("Clicked " + element.id);
        }

    }
}
</script>

<style>
body {
    background-color: #F4f4F4;
}
</style>