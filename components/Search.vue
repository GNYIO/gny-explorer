<template>

  <el-input placeholder="Block height" v-model="input" @keyup.enter.native="search">
    <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
  </el-input>

</template>

<script>

export default {
  data() {
    return {
      input: '',
    }
  },

  methods: {
    async search() {
      const height = this.input;
      // console.log(this.$route.params.height);
      this.$router.push({name: 'block', query: {height: height}});
    }
  },

  async mounted() {
  },
}
</script>

<style>
.el-input {
  width: 300px;
  margin-right: 0;
  float: right;
}
</style>