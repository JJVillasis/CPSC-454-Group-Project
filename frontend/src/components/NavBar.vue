<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#"></a>
      <router-link class="nav-heading" to="/">
      <img src="../assets/cameraBuddy.png" width="80" height="80" class="d-inline-block" alt="">Pictografy
      </router-link>
      
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarText"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarText">
        <ul class="navbar-nav mx-auto">
          <form class="form-inline">
            <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" v-model="searchtext" size="50">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit" v-on:click="onClick($event)">Go</button>
          </form>
        </ul>

        <button v-if="isLoggedIn()" class="btn btn-info">
          <router-link class="nav-link" to="profile">Profile</router-link>
        </button>
        <button v-if="isLoggedIn()" class="btn btn-info">
          <router-link class="nav-link" to="upload">Upload</router-link>
        </button>
        <button v-if="!isLoggedIn()" class="btn btn-info mr-3" type="button"><router-link class="nav-link" to="register">Sign Up</router-link></button>
        <button v-if="!isLoggedIn()" class="btn btn-info" type="button"><router-link class="nav-link" to="login">Sign In</router-link></button>
        <button v-if="isLoggedIn()" class="btn btn-info">
          <router-link class="nav-link" to="logout">Sign Out</router-link>
        </button>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
      name: 'NavBar',
      data() {
        return {
          searchtext: ''
        }
      },
      methods: {
        isLoggedIn: function() {
          if(this.$cognitoAuth.getCurrentUser() === null) {
            return false;
          } else {
            return true;
          }
        },
        onClick: function (event) {
          if (event) {
            event.preventDefault()
          }
          this.$router.replace({ path: '/', query: { text: this.searchtext }})
        }
    }
  }
  
  </script>

  <style>

  .nav-heading:link {
    font-size: 45px;
    color: #fff;
    text-decoration: none;
  }

  .nav-heading:visited {
    font-size: 45px;
    color: #fff;
    text-decoration: none;
  }

  .nav-link {
    color: #fff;
    text-decoration: none;
  }
  

  </style>
  