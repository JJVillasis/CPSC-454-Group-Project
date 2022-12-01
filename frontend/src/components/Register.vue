<template>
    <div class="login-box">
        <h4>Register</h4>
        <hr/>
        <div class="alert alert-warning" v-if="error != null"><span class="white-text">{{ error.message }}</span></div>
        <p>Don't have an account? Register for one now</p>
         <form class="form-group">
            <div class="input-field">
                <label for="username">Username</label>
                <input id="username" type="text" class="form-control" v-model="username" required>
            </div>
            <div class="input-field">
                <label for="email">Email</label>
                <input id="email" type="text" class="form-control" v-model="email" required>
            </div>
            <div class="input-field">
                <label for="password">Password</label>
                <input id="password" type="password" class="form-control" v-model="pass" required>
                <p class="password__specify">Password must have:</p>
                <ul>At least 8 characters</ul>
                <ul>Upper and lowercase letters</ul>
                <ul>Numeric characters</ul>
                <ul>Symbolic characters</ul>
            </div>
            <div class="center-align">
                <hr/>
                <button v-on:click="authenticate($event)" class="btn btn-primary btn-large">Register</button>
                <hr/>
                <p>Already have an account? - <router-link to="Login">Login Now</router-link></p> 
            </div>
        </form>
    </div>
</template>
<script>
export default {
    // eslint-disable-next-line
  name: 'Register',
  data() {
      return {
          username: '',
          email: '',
          pass: '',
          error: null
      }
  },
  methods: {
    authenticate (event) {
        if (event) {
            event.preventDefault()
        }
        /*eslint: no-unused-vars: "on"*/
            // eslint-disable-next-line

        this.$cognitoAuth.signup(this.username, this.email, this.pass, (err, ) => {
            console.log("error:" + err)
            if (err) {
                this.error = err
            } else {
                this.$router.push({path: '/confirm'})
            }
        })
    }
  }
}
</script>

<style scoped>
h4 {
    text-align: center;
    margin: 0;
    padding: 0;
    font-weight: 800;
    font-size: 18px;
}
p {
    text-align: center;
    font-size: 14px;
    padding-bottom: 10px;
}
ul {
    list-style-type: square;
    font-size: 11px;
    margin: 0;
    padding-left: 10px;
    color: grey;
}

.password__specify {
    text-align: justify;
    padding-bottom: 0%;
    margin-bottom: 0;
}

.login-box {
    width: 400px;
    height: auto;
    background-color: white;
    margin-top: 60px;
    border-radius: 5px;
    padding: 40px;
    margin: auto;
    margin-top: 60px;
    border: 1px solid #E4E6E7;
    box-shadow: 0px 2px 5px rgba(0,0,0,0.4);
}
</style>