<template>
  <el-container >
      <el-header class="header">
        <nav class="inner" >
          <img src="../assets/logo.png" alt="logo" class="logo">
          <router-link to="/" >EXPLORER</router-link>
          <Search />
        </nav>
      </el-header>
      <el-main>
        <nuxt />

      </el-main>
      <el-footer>

      </el-footer>
    </el-container>

</template>

<script>
import Logo from '~/components/Logo.vue';
import Search from '~/components/Search.vue';

export default {
  components: {
    Logo,
    Search
  }
}
</script>

<style>
body {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

a {
  text-decoration: none;
}

.header {
  z-index: 999;
  height: 60px;
}

.inner {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 15px 15px;
}

.logo {
  width: 40px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}

</style>
