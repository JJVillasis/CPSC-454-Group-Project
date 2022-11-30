<template>
    <div class="imageContainer">
      <!-- Show image -->
      <router-link :to="`/${post.image_id}`">
        <img class="card-img-top" :src="post.imgURL" alt="">
      </router-link>

      <div class="imageInfo">
        <div class="imageInfoLeft">
          <h1 class="imageTitle"><strong>{{post.caption}}</strong></h1>
          <h5 class="imageLikes">Likes: {{post.likes}}</h5>
          <h5 class="imageDislikes">Dislikes: {{post.dislikes}}</h5>
          <div v-for="tag in this.post.tags" :post="tag" v-bind:key="tag">
            <router-link :to="`/?tag=${tag}`">#{{tag}}</router-link>
          </div>
        </div>

        <div class="imageInfoRight">
          <h3 class="imageAuthor"><i>{{post.username}}</i></h3>
          <div class="d-flex flex-row-reverse">
            <button class="btn btn-danger ml-2" v-on:click="dislike_button" ref="Dislike">
              {{Dislike}}
            </button>
            <button class="btn btn-success ml-2" v-on:click="like_button" ref="Like">
              {{Like}}
            </button>
          </div>
        </div>
      </div>
    </div>

    <h1 class="comments"> Comments </h1>

    <div v-if="this.post.comments !== undefined && this.post.comments.length > 0">
      <div class="commentsContainer">
        <div v-for="comment in post.comments" :post="comment" v-bind:key="comment">
          <hr>
          <h3 class="commentName"><i>{{comment.username}}</i></h3> 
          <h6 class="commentDate">
            ({{new Date(comment.comment_date).getMonth().toString()}}-{{new Date(comment.comment_date).getDay().toString()}}-{{new Date(comment.comment_date).getFullYear().toString()}})
          </h6>
          <div class="commentText">
            {{comment.comment_contents}}
          </div>
        </div>
        <hr>
      </div>
    </div>
</template>

<script>

//import PostComponent from "@/components/PostComponent";
import config from "@/config";
import CognitoAuth from "@/cognito";
import axios from "axios";
import getPosts from "@/get-posts";

export default {
  name: 'SingleImage',
  data() {
    return {
      post: {image_id: 0, imageUrl: ""},
      Like: "Like",
      Dislike: "Dislike"
    }
  },
  mounted() {
      this.Like = this.post.userLikes !== undefined ? (this.post.userLikes.liked ? "Liked" : "Like") : "Like";
      this.Dislike =  this.post.userLikes !== undefined ? (this.post.userLikes.disliked ? "Disliked" : "Dislike"): "Dislike";
  },
  methods : {
    getBackendUrl: function () {
      return config.prod ? config.backendProd : config.backendLocal;
    },
    onClick: function (event, tag) {
      if (event) {
        event.preventDefault()
      }
      this.$router.replace({ path: '/', query: { tag: tag }})
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
            this.Like = this.post.userLikes !== undefined ? (this.post.userLikes.liked ? "Liked" : "Like") : "Like";
            this.Dislike =  this.post.userLikes !== undefined ? (this.post.userLikes.disliked ? "Disliked" : "Dislike"): "Dislike";
          }
      );
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
  },
  beforeMount() {
    this.getdata();
  },
}
</script>

<style scoped>
.imageContainer {
  max-width: 90%;
  margin: auto;
  margin-bottom: 20px;
}

.imageInfo {
  overflow: auto;
}

.imageInfoLeft {
  float: left;
}
.imageInfoRight {
  float: right;
}

/* Comments Section */

.comments {
  max-width: 90%;
  margin: auto auto 0px;
  background-color: lightgray;
  text-align: center;
}

.commentsContainer {
  max-width: 90%;
  clear: both;
  margin: auto;
}

.commentText {
  margin-bottom: 20px;
}

hr {
  border-color: black;
  margin-top: 0px;
}
</style>