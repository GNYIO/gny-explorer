<template>
  <el-container >
    <el-header>
      <!-- <img src="../assets/logo.png" alt="logo" class="head-log"> -->
      <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="/index">EXPLORER</el-menu-item>
        <el-menu-item >
          <el-form :inline="true" :model="formInline" class="demo-form-inline">
            <el-form-item>
              <el-input placeholder="Explore"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">Search</el-button>
            </el-form-item>
          </el-form> 
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <Basic />

      <Block />

    </el-main>
    <el-footer>

    </el-footer>
  </el-container>
</template>

<script>
import Logo from '~/components/Logo.vue';
import Basic from '~/components/Basic.vue';
import Block from '~/components/Block.vue';

export default {
  components: {
    Logo,
    Basic,
    Block,
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
</style>
