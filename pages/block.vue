<template>
  <el-container>
    <el-row>
      <el-col :span="8" >
        Height
        <p >{{block.height}}</p>
      </el-col>
      <el-col :span="8" >
        ID
        <p >{{block.id}}</p>
      </el-col>
      <el-col :span="8" >
        Date
        <p >{{block.timestamp}}</p>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="8" >
        Transaction count
        <p >{{block.count}}</p>
      </el-col>
      <el-col :span="8" >
        Transaction Fees
        <p >{{block.fees}}</p>
      </el-col>
      <el-col :span="8" >
        Reward
        <p >{{block.reward}}</p>
      </el-col>
    </el-row>
    <h2>Transactions included in this block</h2>
    
    <el-table :data="transactions" stripe style="width: 80%; margin: auto;">
      <el-table-column prop="height" align="center" label="Height" width="200"></el-table-column>
      <el-table-column prop="id" align="center" label="Block ID" width="300"></el-table-column>
      <el-table-column prop="timestamp" align="center" label="Forged Time" width="180"></el-table-column>
      <!-- <el-table-column prop="fees" align="center" label="Fee"></el-table-column> -->
      <el-table-column prop="delegate" align="center" label="Delegate"></el-table-column>
    </el-table>
  </el-container>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);



export default {
  data() {
    return {
      block: {},
      transactions: [],
    }
  },

  async mounted() {
    const height = this.$route.query.height;
    this.block  = (await connection.api.Block.getBlockByHeight(height)).block;
    this.transactions = this.block.transactions;
  }


}
</script>

<style>

</style>
