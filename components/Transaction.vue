<template>
  <el-container>
    <h2>Latest transactions</h2>
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
import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);

export default {
  data() {
    return {
      transactions: '',
    }
  },

  async mounted() {
    const limit = 5;
    const offset = 0;
    const orderBy = 'height:desc';
    this.blocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;

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