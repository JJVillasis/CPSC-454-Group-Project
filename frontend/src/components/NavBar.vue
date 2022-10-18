<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <a class="navbar-brand" href="#">
    <img src="../assets/cameraBuddy.png" width="80" height="80" class="d-inline-block" alt="">
    Pictografy
  </a>
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
    <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Go</button>
  </form>
        </ul>
        <button class="btn btn-info mr-3" type="button">Sign Up</button>
        <button class="btn btn-info" type="button">Sign In</button>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
      name: 'NavBar'
  }
  </script>
  
  <style>
  </style>
  