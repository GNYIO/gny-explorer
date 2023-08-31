<template>
  <el-container>
    <el-row class="nerwork-header">
      <el-col><span class="current_network" >{{network}}</span></el-col>
    </el-row>
    <el-header class="header">
      <b-navbar toggleable="lg" variant="secondary" class="bg-transparent">
        <b-navbar-brand>
          <nuxt-link to="/">
            <img src="../assets/logo.png" alt="logo" class="logo">
          </nuxt-link>
        </b-navbar-brand>

        <b-navbar-toggle target="nav_collapse">
          <template #default="{ expanded }">
            <svg
            style="display: inline-block; width: 1.5em; height: 1.5em; vertical-align: middle; content: ''; background: no-repeat center center; background-image: none; background-size: auto; background-size: 100% 100%;"
            xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><path stroke='rgba(0, 0, 0, 0.5)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/></svg>
          </template>
        </b-navbar-toggle>

        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav>
            <b-nav-item>
              <nuxt-link to="/blocks" class="second-link">BLOCKS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/transactions" class="second-link">TRS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/delegates" class="second-link">DELEGATES</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/assets" class="second-link">ASSETS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/burnings" class="second-link">BURNINGS</nuxt-link>
            </b-nav-item>
            <b-nav-item>
              <nuxt-link to="/nfts" class="second-link">NFTS</nuxt-link>
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
      type="warning" 
      v-if="!height"
      show-icon>
    </el-alert>
    <el-main>
      <nuxt />

    </el-main>
    <el-footer>
      © 2023 by gny.io Limited
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

.el-main {
  padding: 0.5rem 0.5rem;
  margin-top: 1rem;
}

@media screen and (min-width: 600px) {
  .el-main {
    padding: 1rem 1rem;
  }
}

@media screen and (min-wdith: 800px) {
  .el-main {
    padding: 2rem 2rem;
  }
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
  padding: 0;
}

.nerwork-header {
  z-index: 999;
  height: 20px;
}

/* .inner {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 5px 5px;
} */

.second-link {
    margin-left: 7px;
}

.logo {
  width: 45px;
  display: inline-block;
  vertical-align: middle;
}

.el-alert {
  position: fixed;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
}

.el-footer {
  text-align: center;
  color: #acacac;
}

.current_network {
  float: right;
  padding-right: 1.2rem;
}

</style>
