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
      this.$router.push({name: 'block-detail', query: {height: height}});
    }
  },

  async mounted() {
  },
}
</script>

<style scoped>
.el-input {
  width: 300px;
  margin-right: 0;
  float: right;
}
</style>