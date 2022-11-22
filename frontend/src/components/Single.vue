
<template>
    <div>
        <h2>Single Image: {{ $route.params.id }}</h2>
      <div class ="row">
        <post-component :post="this.post" v-bind:key="this.post"/>
      </div>
    </div>
</template>

<script>

import PostComponent from "@/components/PostComponent";
import config from "@/config";
import CognitoAuth from "@/cognito";
import axios from "axios";
import getPosts from "@/get-posts";

export default {
    // eslint-disable-next-line
    name: 'Single',
  components: {
    PostComponent
  },
  data() {
    return {
      post: {image_id: 0, imageUrl: ""}
    }
  },
  methods : {
    getBackendUrl: function () {
      return config.prod ? config.backendProd : config.backendLocal;
    },
    getdata: function () {
      let currentUsername = CognitoAuth.getCurrentUser().getUsername();
      axios.get(this.getBackendUrl() + "/search?image_id=" + this.$route.params.id + "&currentuser=" + currentUsername, {
        //We can add more configurations in this object
        params: {

          //This is one of the many options we can configure
        }
      }).then(response => {
            this.post = getPosts(response.data, 0, 1)[0];
          }
      );
    },
  },
  beforeMount() {
    this.getdata();
  },
}
</script>

<style scoped>
body {
  background-color: #F4f4F4;
}
</style>