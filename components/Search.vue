<template>

  <el-input placeholder="Block height" v-model="input" @keyup.enter.native="search">
    <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
  </el-input>

</template>

<script>
import { joi } from '@gny/extended-joi';

export default {
  data() {
    return {
      input: '',
    }
  },

  methods: {
    async search() {
      const input = this.input;

      const addressSchema = joi
        .string()
        .address()
        .required();
      const addressReport = joi.validate(input, addressSchema);
      if (!addressReport.error) {
        this.$router.push({name: 'account-detail', query: {address: input}});
      }

      const usenameSchema = joi
        .string()
        .username()
        .required();
      const usernameReport = joi.validate(input, usenameSchema);
      if (!usernameReport.error) {
        this.$router.push({name: 'account-detail', query: {username: input}});
      }
      
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