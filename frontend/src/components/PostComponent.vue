<template>
    <div class="card">
      <router-link :to="`/${post.image_id}`">
        <img class="card-img-top" :src="post.imgURL" alt="">
      </router-link>
        <div class="card-body">
          <h5 class="card-title">{{post.caption}}</h5>
          <h6 class="card-user">{{post.username}}</h6>
          <h6 class="card-likes">Likes: {{post.likes}}</h6>
          <h6 class="card-likes">Dislikes: {{post.dislikes}}</h6>
          <div v-for="tag in this.post.tags" :post="tag" v-bind:key="tag">
            <a href="/search?tag={{tag}}">#{{tag}}</a>
          </div>
          <div class="d-flex flex-row-reverse">
              <button class="btn btn-danger ml-2" v-on:click="dislike_button" ref="Dislike">
                  {{Dislike}}
              </button>
              <button class="btn btn-success ml-2" v-on:click="like_button" ref="Like">
                  {{Like}}
              </button>
          </div>
          <div v-if="this.post.comments !== undefined && this.post.comments.length > 0">
            <div class="container"><h4>Comments</h4>
              <div v-for="comment in post.comments" :post="comment" v-bind:key="comment">
                <h6>{{comment.username}}</h6> <h6>{{new Date(comment.comment_date).toLocaleString()}}</h6>
                <div>
                  {{comment.comment_contents}}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </template>



  <script>
  import config from '../config'
  import CognitoAuth from './../cognito';
  import axios from 'axios';
  export default {
          data() {
          return {
              Like: "Like",
              Dislike: "Dislike"
          }
      },

     props: {
      post: Object
     },
    mounted() {
      this.Like = this.post.userLikes !== undefined ? (this.post.userLikes.liked ? "Liked" : "Like") : "Like";
      this.Dislike =  this.post.userLikes !== undefined ? (this.post.userLikes.disliked ? "Disliked" : "Dislike"): "Dislike";
    },
    methods: {
              getBackendUrl: function () {
                  return config.prod ? config.backendProd : config.backendLocal;
              },
              import_like: function () {
                let myThis = this;
                CognitoAuth.getIdToken(function (err, token) {
                  if (err) {
                    return alert("There was an error with your account: " + err.message);

                  } else {
                    axios.post(myThis.getBackendUrl() + "/like", {
                      "image_id": myThis.post.image_id,
                      "username": CognitoAuth.getCurrentUser().getUsername(),
                      "like": myThis.Like === "Liked",
                      "dislike": myThis.Dislike === "Disliked",
                      "jwt": token
                    }, {
                      params: {},
                      headers: {
                        "Access-Control-Allow-Origin": "*",
                        'Content-Type': 'application/json',
                      }
                    })
                  }
                })
              },
              like_button: function () {
                  console.log("Clicked Like");
                  if (this.Like === "Like") {
                      this.Like = "Liked"
                  }
                  else if (this.Like === "Liked") {
                      this.Like = "Like"
                  }
                  this.Dislike = "Dislike"
                  this.import_like()
              },
              dislike_button: function () {
                  console.log("Clicked Dislike");
                  if (this.Dislike === "Dislike") {
                      this.Dislike = "Disliked"
                  }
                  else if (this.Dislike === "Disliked") {
                      this.Dislike = "Dislike"
                  }
                  this.Like = "Like"
                  this.import_like()
              }
          }
  }
  </script>

  