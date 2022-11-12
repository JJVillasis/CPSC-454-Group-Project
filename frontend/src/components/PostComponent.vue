<template>
    <div class="card">
      <img class="card-img-top" :src="post.imgURL" alt="">
        <div class="card-body">
          <h5 class="card-title">{{post.caption}}</h5>
          <h6 class="card-user">{{post.username}}</h6>
          <h5 class="card-likes">Likes: {{post.likes}}</h5>
          <h5 class="card-likes">Dislikes: {{post.dislikes}}</h5>
          <div v-for="tag in this.post.tags" :post="tag" v-bind:key="tag">
            <a href="/search?tag={{tag}}">#{{tag}}</a>
          </div>
        </div>
    </div>
  </template>
  <script>
  import config from '../config'
  export default {
     props: {
      post: Object
     },
    methods: {
      getBackendUrl: function () {
        return config.prod ? config.backendProd : config.backendLocal;
      }
    }
  }
  </script>

  