<template>
  <el-container >
      <el-header class="header">
        <nav class="inner" >
          <nuxt-link to="/">
            <img src="../assets/logo.png" alt="logo" class="logo">
          </nuxt-link>
          <nuxt-link to="/blocks" class="second-link">BLOCKS</nuxt-link>
          <nuxt-link to="/transactions" class="second-link">TRANSACTIONS</nuxt-link>
          <nuxt-link to="/delegates" class="second-link">DELEGATES</nuxt-link>
          <nuxt-link to="/assets" class="second-link">ASSETS</nuxt-link>
          <nuxt-link to="/peers" class="second-link">PEERS</nuxt-link>
          <Search />
        </nav>
      </el-header>
      <el-main>
        <nuxt />

      </el-main>
      <el-footer>
        © 2020 by gny.io Limited
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
  -webkit-font-smoothing: antialiased;
}

a {
  text-decoration: none;
}

.header {
  z-index: 999;
  height: 50px;
}

.inner {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 15px 15px;
}

.second-link {
    margin-left: 20px;
}

.logo {
  width: 45px;
  margin-right: 30px;
  display: inline-block;
  vertical-align: middle;
}

.el-footer {
  text-align: center;
  color: #acacac;
}

</style>
