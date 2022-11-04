<template>
    <div class="card">
      <img class="card-img-top" :src="post.imgURL" alt="">
        <div class="card-body">
          <h5 class="card-title">{{post.caption}}</h5>
          <h6 class="card-user">{{post.username}}</h6>
        </div>
    </div>
  </template>
  <script>
    export default {
     props: {
      post: Object
     }
    }
  </script>

  