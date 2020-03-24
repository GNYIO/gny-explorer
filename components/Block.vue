<template>
  <el-container>
    <h2>Latest blocks</h2>
    <el-table :data="blocks" stripe style="width: 80%; margin: auto;">
      <el-table-column prop="height" align="center" label="Height" width="200"></el-table-column>
      <el-table-column prop="id" align="center" label="Block ID" width="300"></el-table-column>
      <el-table-column prop="timestamp" align="center" label="Forged Time" width="180" :formatter="timestamp2date"></el-table-column>
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
      blocks: [],
    }
  },

  methods: {
    timestamp2date: function (row, column) {
      console.log(row.timestamp);
      return moment(row.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');
    }
  },

  async mounted() {
    const limit = 5;
    const offset = 0;
    const orderBy = 'height:desc';

    this.blocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;
    // this.blocks = this.blocks.map(block => block['date']= moment(block.timestamp).format('YYYY-MM-DD hh:mm'));

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