<template>
  <el-row>
    <el-row class="basic">
      <el-col :span="8" >
        Blocks
        <p v-if="blocks">{{blocks}}</p>
      </el-col>
      <el-col :span="8" >
        Transactions
        <p v-if="transactions">{{transactions}}</p>
      </el-col>
      <el-col :span="8" >
        Delegates
        <p v-if="dalegates">{{dalegates}}</p>
      </el-col>
    </el-row>
    <el-row class="statics">
      <el-col :span="8" >
        Blockchain size
        <p v-if="size">{{size}}</p>
      </el-col>
      <el-col :span="8" >
        Latest block height
        <p v-if="latestHeight">{{latestHeight}}</p>
      </el-col>
      <el-col :span="8" >
        Nodes
        <p v-if="nodes">{{nodes}}</p>
      </el-col>
    </el-row>
  </el-row>

  
</template>

<script>
import { BigNumber } from 'bignumber.js';
import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);

export default {
  data() {
    return {
      blocks: '',
      transactions: '',
      dalegates: '',
      latestHeight:'',
      nodes: '',
    }
  },

  async mounted() {
    const height = (await connection.api.Block.getHeight()).height;
    this.blocks = new BigNumber(height).plus(1).toFixed();
    this.dalegates = (await connection.api.Delegate.getDelegates()).totalCount;
    this.transactions = String((await connection.api.Transaction.getTransactions({})).count);
    this.latestHeight = height;
    this.nodes = (await connection.api.Peer.getPeers()).count;
    
  },
}
</script>

<style>
.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}
</style>