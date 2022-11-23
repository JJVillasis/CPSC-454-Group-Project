<!--template>
  <div class="container">
    <div class="upload-wrapper">
      <h4>Upload Images</h4>
      <div class="alert alert-warning" v-if="error">{{ error }}</div>
      <div class="alert alert-info" v-if="status">{{ status }}</div>
      <div class="upload-form">
        <div v-bind="getRootProps()">
          <input v-bind="getInputProps()"/>
          <p v-if="isDragActive">Drop the files here ...</p>
          <p v-else>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </div>
    </div>
  </div>
</template-->

<script>
import CognitoAuth from './../cognito';
import config from './../config';
import axios from 'axios';
const AWS = require('aws-sdk');

import {reactive, watch} from 'vue';
import {useDropzone} from 'vue3-dropzone';
import PostComponent from "@/components/PostComponent";


export default {
  // eslint-disable-next-line
  name: "Upload",
  components: {PostComponent},
  setup() {
    //Vue = getCurrentInstance();

    const state = reactive({
      files: [],
    });

    let post = reactive({
      imgUrl: null,
      caption: "No image",
      tags: "",
      username: CognitoAuth.getCurrentUser().getUsername()
    })

    let caption = reactive({
      text: ""
    })

    let tags = reactive({ text:"" })

    function getBackendUrl() {
      return config.prod ? config.backendProd : config.backendLocal;
    }

    function addPhoto() {
      CognitoAuth.getIdToken(function (err, token) {
        if (err) {
          return alert("There was an error uploading your photo: " + err.message);

        } else {
          const idKey = 'cognito-idp.us-east-1.amazonaws.com/' + config.IdentityPoolId;

          AWS.config.update({
            region: config.bucketRegion,
            credentials: new AWS.CognitoIdentityCredentials({
              IdentityPoolId: config.IdentityPoolIdLong,
              Logins: {
                [idKey]: token
              }
            })
          });

          /*const s3 = new AWS.S3({
            apiVersion: "2006-03-01",
            params: {Bucket: config.bucket}
          });*/

          const files = state.files
          if (!files.length) {
            return alert("Please choose a file to upload first.");
          }
          var file = files[0];
          var fileName = file.name;
          var albumPhotosKey = CognitoAuth.getCurrentUser().getUsername() + "/";

          var photoKey = albumPhotosKey + fileName;

          // Use S3 ManagedUpload class as it supports multipart uploads
          var upload = new AWS.S3.ManagedUpload({
            params: {
              Bucket: config.bucket,
              Key: photoKey,
              Body: file
            }
          });

          const promise = upload.promise();

          promise.then(
              function (data) {
                console.log("Successfully uploaded photo: " + data.Location);
                alert("Successfully Uploaded photo: " + data.Key);
                axios.post(getBackendUrl() + "/addimage", {
                  "objectId": photoKey,
                  "username": CognitoAuth.getCurrentUser().getUsername(),
                  "caption": caption.text,
                  "tags": tags.text,
                  "jwt" : token
                }, {
                  params: { },
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    'Content-Type': 'application/json',}
                }).then(
                    response => {
                      console.log(response)
                    }
                )
              },
              function (err) {
                return alert("There was an error uploading your photo: " + err.message);
              }
          );
        }
      })
    }


    function onDrop(acceptFiles, rejectReasons) {
      console.log(acceptFiles);
      console.log(rejectReasons);
      state.files = acceptFiles;
      post.imgUrl = acceptFiles[0].path;
      post.caption = acceptFiles[0].name;

      //addPhoto()
    }

    const {getRootProps, getInputProps, isDragActive, ...rest} = useDropzone({
      onDrop,
    });

    watch(state, () => {
      console.log('state', state);
    });

    watch(isDragActive, () => {
      console.log('isDragActive', isDragActive.value, rest);
    });

    function upload() {
      addPhoto()

    }

    return {
      getRootProps,
      getInputProps,
      isDragActive,
      post,
      state,
      caption,
      tags,
      upload,
      ...rest
    };
  },
  data: function () {
    return {
      error: '',
      status: ''
    }
  },
  beforeMount() {

  },
  methods: {
    // no methods since can't figure out how to put them here.
  }
};
</script>

<template>
  <div>
    <div class="dropzone" v-bind="this.getRootProps()">
      <div
          class="border"
          :class="{isDragActive,}"
      >
        <input v-bind="this.getInputProps()" />
        <p v-if="isDragActive">Drop the files here ...</p>
        <p v-else>Drag and drop files here, or Click to select files</p>
      </div>
    </div>

    <div v-if="state.files.length > 0">
      <h4 class="upload-wrapper">You have chosen a file</h4>
      Caption:<input v-model="caption.text" placeholder="enter caption here" />
      Tags:<input v-model="tags.text" placeholder="enter tags here" />
      <button class="btn btn-info" v-on:click="upload">Upload
      </button>
      <post-component :post="post" v-bind:key="post"/>
    </div>
  </div>
</template>

<style scoped>
.upload-wrapper {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #E4E6E7;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.4);
}

.upload-wrapper h4 {
  font-size: 22px;
  margin: 0;
  padding: 0;
  margin-bottom: 40px;
}
.dropzone,
.files {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 10px;
  border-radius: 8px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
  rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  font-size: 12px;
  line-height: 1.5;
}

.border {
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
  background: #fff;

&.isDragActive {
   border: 2px dashed #ffb300;
   background: rgb(255 167 18 / 20%);
 }
}

.file-item {
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgb(255 167 18 / 20%);
  padding: 7px;
  padding-left: 15px;
  margin-top: 10px;

&:first-child {
   margin-top: 0;
 }

.delete-file {
  background: red;
  color: #fff;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
}
}

.dropbox {
  outline: 2px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px; /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 200px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}
</style>