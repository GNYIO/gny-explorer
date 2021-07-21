<template>
  <el-container direction="vertical">
    <basic :blocks="blocks" :transactions="transactions" :latestHeight="latestHeight"></basic>

    <Block />

    <Transaction />
  </el-container>
</template>

<script>
import Basic from '~/components/Basic.vue';
import Block from '~/components/Block.vue';
import Transaction from '~/components/Transaction.vue';

import BigNumber from 'bignumber.js';
import * as gnyClient from '@gny/client';
console.log(`endpoint: ${process.env['GNY_ENDPOINT']}`);
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  components: {
    Basic,
    Block,
    Transaction,
  },

  data() {
    return {
      refreshing: null,
    }
  },

  async asyncData() {
    const height = (await connection.api.Block.getHeight()).height;
    const blocks = new BigNumber(height).plus(1).toFixed();
    const transactions = String((await connection.api.Transaction.getTransactions({})).count);
    return {
        blocks : blocks,
        transactions: transactions,
        latestHeight: height,
    }
  },

  methods: {
    refresh() {
      this.refreshing = setInterval(() => {
        this.$nuxt.refresh();
      }, 10000);
    }
  },

  beforeDestroy () {
    clearInterval(this.refreshing);
  },

  created () {
    this.refresh();
  },
}
</script>

<style scoped>
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}



</style>
