<template>
  <el-container>
    <el-row class="nerwork-header">
      <el-col :span="4" :offset="20"><span>{{network}}</span></el-col>
    </el-row>
    <el-header class="header">
      <b-navbar toggleable="lg" variant="secondary" class="bg-transparent">
        <b-navbar-brand>
          <nuxt-link to="/">
            <img src="../assets/logo.png" alt="logo" class="logo">
          </nuxt-link>
        </b-navbar-brand>

        <b-navbar-toggle target="nav_collapse" ></b-navbar-toggle>

        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav>
            <b-nav-item>
              <nuxt-link to="/blocks" class="second-link">BLOCKS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/transactions" class="second-link">TRANSACTIONS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/delegates" class="second-link">DELEGATES</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/assets" class="second-link">ASSETS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/peers" class="second-link">PEERS</nuxt-link>
            </b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <Search />
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </el-header>
    <el-alert
      title="Network is down."
      type="warning" v-if="!height">
    </el-alert>
    <el-main>
      <nuxt />

    </el-main>
    <el-footer>
      © 2021 by gny.io Limited
    </el-footer>
  </el-container>
</template>

<script>
import Logo from '~/components/Logo.vue';
import Search from '~/components/Search.vue';
import * as gnyClient from '@gny/client';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);



export default {
  data() {
    return {
      network: '',
      height: '',
    }
  },

  async mounted() {
    const networkEnv = process.env['GNY_NETWORK'];
    this.network = networkEnv.charAt(0).toUpperCase() + networkEnv.slice(1);
    this.height = (await connection.api.Block.getHeight()).height;
  },

  components: {
    Logo,
    Search
  },
  
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

@media (max-width: 999px) {
  #nav_collapse {
    background-color: #F8F9FA;
  }
}

.header {
  z-index: 999;
  height: 50px;
}

.nerwork-header {
  z-index: 999;
  height: 20px;
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
