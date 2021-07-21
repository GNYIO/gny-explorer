<template>
  <b-card title="Basic" class="shadow">
    <!-- <h4>Basic</h4> -->
    <el-row class="basic">
      <el-col :span="8" >
        Blocks
        <br v-if="blocksCount === ''">
        <i v-if="blocksCount === ''"  class="el-icon-loading"></i>
        <p v-if="blocksCount">{{blocksCount}}</p>
      </el-col>
      <el-col :span="8" >
        Transactions
        <br v-if="transactions === ''">
        <i v-if="transactions === ''"  class="el-icon-loading"></i>
        <p v-if="transactions">{{transactions}}</p>
      </el-col>
      <el-col :span="8" >
        Delegates
        <br v-if="dalegates === ''">
        <i v-if="dalegates === ''"  class="el-icon-loading"></i>
        <p v-if="dalegates">{{dalegates}}</p>
      </el-col>
    </el-row>
    <el-row class="statics">
      <el-col :span="8" >
        Accounts
        <br v-if="accounts === ''">
        <i v-if="accounts === ''"  class="el-icon-loading"></i>
        <p v-if="accounts">{{accounts}}</p>
      </el-col>
      <el-col :span="16" >
        Latest block height
        <br v-if="latestHeight === ''">
        <i v-if="latestHeight === ''"  class="el-icon-loading"></i>
        <p v-if="latestHeight">{{latestHeight}}</p>
      </el-col>
    </el-row>
  </b-card>
</template>

<script>
import * as gnyClient from '@gny/client';
console.log(`endpoint: ${process.env['GNY_ENDPOINT']}`);
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  props: ['blocksCount', 'transactions', 'latestHeight'],

  data() {
    return {
      dalegates: '',
      size: 'loading',
      accounts: '',
    }
  },

  async mounted() {
    this.dalegates = (await connection.api.Delegate.getDelegates()).totalCount;
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