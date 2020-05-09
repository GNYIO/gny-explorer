<template>
  <el-card>
    <h1>Basic</h1>
    <el-row class="basic">
      <el-col :span="8" >
        Blocks:
        <p v-if="blocks">{{blocks}}</p>
      </el-col>
      <el-col :span="8" >
        Transactions:
        <p v-if="transactions">{{transactions}}</p>
      </el-col>
      <el-col :span="8" >
        Delegates:
        <p v-if="dalegates">{{dalegates}}</p>
      </el-col>
    </el-row>
    <el-row class="statics">
      <el-col :span="8" >
        Accounts:
        <p v-if="size">{{accounts}}</p>
      </el-col>
      <el-col :span="16" >
        Latest block height:
        <p v-if="latestHeight">{{latestHeight}}</p>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
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
      blocks: '',
      transactions: '',
      dalegates: '',
      latestHeight:'',
      size: 'loading',
      accounts: '',
    }
  },

  async mounted() {
    const height = (await connection.api.Block.getHeight()).height;
    this.blocks = new BigNumber(height).plus(1).toFixed();
    this.dalegates = (await connection.api.Delegate.getDelegates()).totalCount;
    this.transactions = String((await connection.api.Transaction.getTransactions({})).count);
    this.latestHeight = height;
    this.nodes = (await connection.api.Peer.getPeers()).count;
    this.accounts = (await connection.api.Account.countAccounts()).count;
  },
}
</script>

<style scoped>

.el-col {
  font-weight: 500;
}

p {
  color: #acacac;
}


</style>