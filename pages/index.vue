<template>
  <el-container direction="vertical">
    <basic :blocksCount="blocksCount" :transactions="transactions" :latestHeight="latestHeight"></basic>

    <block :blocks="blocks" :blocksLoading="blocksLoading"></block>

    <transaction :latestTransactions="latestTransactions" :transLoading="transLoading"></transaction>
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
    const blocksCount = new BigNumber(height).plus(1).toFixed();
    const count = (await connection.api.Transaction.getTransactions({})).count;

    let blocksLoading = true;
    const limit = 5;
    const offset = 0;
    const orderBy = 'height:desc';

    const blocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;
    if (blocks.length > 0) {
      blocksLoading = false;
    }

    let transLoading = true;
    const transOffset = count - 5;

    const result = (await connection.api.Transaction.getTransactions({
      limit: limit,
      offset: transOffset,
    })).transactions;

    if (result.length > 0) {
      transLoading = false;
    }

    return {
        blocksCount : blocksCount,
        transactions: count,
        latestHeight: height,
        blocks: blocks,
        blocksLoading: blocksLoading,
        latestTransactions: result,
        transLoading: transLoading,
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
