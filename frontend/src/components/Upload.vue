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

import {getCurrentInstance, reactive, watch} from 'vue';
import {useDropzone} from 'vue3-dropzone';

const state = reactive({
  files: [],
});

const {getRootProps, getInputProps, isDragActive, ...rest} = useDropzone({
  onDrop,
});

watch(state, () => {
  console.log('state', state);
});

watch(isDragActive, () => {
  console.log('isDragActive', isDragActive.value, rest);
});

let Vue = getCurrentInstance();

function sendingEvent(file, xhr, formData) {
  CognitoAuth.getIdToken((err, result) => {
    if (err) {
      Vue.error = err;
    } else {
      const url = config.s3SignedUrl;
      axios.defaults.headers.common['Authorization'] = result;
      let headers = {
        "Access-Control-Allow-Origin": "*"
      };
      axios({method: 'post', url: url, headers: headers, data: {name: file.name, type: file.type}})
          .then(x => {
            var options = {
              headers: {
                'Content-Type': file.type,
                'Access-Control-Allow-Origin': '*'
              }
            }
            delete axios.defaults.headers.common['Authorization'];
            axios.put(x.data.uploadURL, file, options)
          })
          .then(status => {
            Vue.status = status;
          })
          .catch(err => {
            Vue.error = err;
          })
    }
  })
}

function onDrop(acceptFiles, rejectReasons) {
  console.log(acceptFiles);
  console.log(rejectReasons);
  state.files = acceptFiles;
  //sendingEvent(acceptFiles[0], null, null)
  addPhoto()
}

function handleClickDeleteFile(index) {
  state.files.splice(index, 1);
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
          //IdentityId: config.UserPoolId,
          Logins: {
            [idKey]: token
          }
        })
      });

      const s3 = new AWS.S3({
        apiVersion: "2006-03-01",
        params: {Bucket: config.bucket}
      });

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
            alert("Successfully uploaded photo.");
          },
          function (err) {
            return alert("There was an error uploading your photo: " + err.message);
          }
      );
    }
  })
}

export default {
  // eslint-disable-next-line
  name: "Upload",

  setup() {
    Vue = getCurrentInstance();

    return {
      getRootProps,
      getInputProps,
      isDragActive,
      ...rest,
    };
  },
  data: function () {
    return {
      error: '',
      status: '',
      signurl: '',
      dropzoneOptions: {
        url: 'https://httpbin.org/post',
        thumbnailWidth: 200,
        addRemoveLinks: true,
        autoProcessQueue: false
      },
      awss3: {
        signingURL: 'http://aws-direct-s3.dev/',
        headers: {},
        params: {}
      },
    }
  },
  methods: {
    /*eslint no-unused-vars: "off"*/
    sendingEvent(file, xhr, formData) {
      this.$cognitoAuth.getIdToken((err, result) => {
        if (err) {
          this.error = err;
        } else {
          const url = config.s3SignedUrl;
          axios.defaults.headers.common['Authorization'] = result;
          let headers = {
            "Access-Control-Allow-Origin": "*"
          };
          axios({method: 'post', url: url, headers: headers, data: {name: file.name, type: file.type}})
              .then(x => {
                var options = {
                  headers: {
                    'Content-Type': file.type,
                    'Access-Control-Allow-Origin': '*'
                  }
                }
                delete axios.defaults.headers.common['Authorization'];
                axios.put(x.data.uploadURL, file, options)
              })
              .then(status => {
                this.status = status;
              })
              .catch(err => {
                this.error = err;
              })
        }
      })
    }
  }
};
</script>

<template>
  <div>
    <div class="dropzone" v-bind="getRootProps()">
      <div
          class="border"
          :class="{
          isDragActive,
        }"
      >
        <input v-bind="getInputProps()" />
        <p v-if="isDragActive">Drop the files here ...</p>
        <p v-else>Drag and drop files here, or Click to select files</p>
      </div>
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