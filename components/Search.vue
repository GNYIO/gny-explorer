<template>
  <el-menu-item >
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="Explore" v-model="form.item"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">Search</el-button>
      </el-form-item>
    </el-form> 
  </el-menu-item>

  

</template>

<script>
// import * as gnyClient from '@gny/client';
// const connection = new gnyClient.Connection(
//   process.env['GNY_ENDPOINT'],
//   process.env['GNY_PORT'],
//   process.env['GNY_NETWORK'],
// );

export default {
  data() {
    return {
      form: {
        item: '',
      },
    }
  },

  methods: {
    async search() {
      const height = this.form.item;
      // console.log(this.$route.params.height);
      this.$router.push({name: 'block', query: {height: height}});
    }
  },

  async mounted() {
  },
}
</script>

<style>
</style>