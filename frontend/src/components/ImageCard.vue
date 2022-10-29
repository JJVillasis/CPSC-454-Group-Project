<template>
    <div class="card">
        <img class="card-img-top" :src="img" alt="">
        <div class="card-body">
            <h5 class="card-title">{{post.caption}}</h5>
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
