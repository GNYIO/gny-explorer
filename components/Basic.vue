<template>

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
  

</template>

<script>
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
    }
  },

  async mounted() {
    this.blocks = (await connection.api.Block.getHeight()).height;
    this.dalegates = (await connection.api.Delegate.getDelegates()).totalCount;
    // this.transactions = ;
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