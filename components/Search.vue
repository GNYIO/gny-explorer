<template>

  <el-input placeholder="Address/Block height ..." v-model="input" @keyup.enter.native="search">
    <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
  </el-input>

</template>

<script>
import { joi } from '@gny/extended-joi';
import BigNumber from 'bignumber.js';
import * as gnyClient from '@gny/client';

console.log(`endpoint: ${process.env['GNY_ENDPOINT']}`);
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS'] || false,
);

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

      const heightSchema = joi
        .string()
        .positiveOrZeroBigInt()
        .required();
      const heightReport = joi.validate(input, heightSchema);
      if (!heightReport.error) {
        this.$router.push({name: 'block-detail', query: {height: input}});
      }

      const assetSchema = joi
        .string()
        .asset()
        .required();
      const assetReport = joi.validate(input, assetSchema);
      if (!assetReport.error) {
        this.$router.push({name: 'asset-detail', query: {assetName: input}});
      }

      const usernameSchema = joi
        .string()
        .username()
        .required();
      const usernameReport = joi.validate(input, usernameSchema);
      if (!usernameReport.error) {
        try {
          const result = await connection.api.Account.getAccountByUsername(username);
          if (result.success === true) {
            this.$router.push({name: 'account-detail', query: {username: input}});
          }         
        } catch (error) {
          console.log(error.message);
        }
      }

      const blockOrTrsIdSchema = joi
        .string()
        .hex(64)
        .required();
      const blockOrTrsIdReport = joi.validate(input, blockOrTrsIdSchema);

      if (!blockOrTrsIdReport.error) {
        try {
          const block = (await connection.api.Block.getBlockById(input)).block;
          if (block) {
            this.$router.push({name: 'block-detail', query: {height: block.height}});
          } else {
            const trsQuery = {
              id: input,
            }
            const transaction = (await connection.api.Transaction.getTransactions(trsQuery)).transactions[0];

            if (transaction) {
              this.$router.push({name: 'transaction-detail', query: {id: input}});
            }
          }
        } catch (error) {
          console.log(error.message);
        }
      }      
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