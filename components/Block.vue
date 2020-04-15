<template>
  <el-card>
    <h2>Latest blocks</h2>
    <el-table class="clickable-rows" @row-click="rowClick" :data="blocks" stripe style="width: 95%; margin: auto;">
      <el-table-column prop="height" align="center" label="Height" width="150"></el-table-column>
      <el-table-column prop="id" align="center" label="Block ID" width="200" :formatter="subID"></el-table-column>
      <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
      <!-- <el-table-column prop="fees" align="center" label="Fee"></el-table-column> -->
      <el-table-column prop="delegate" align="center" label="Delegate" :formatter="subDelegate"></el-table-column>
    </el-table>

  </el-card>
  
  

</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
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
    rowClick: function(row) {
        console.log(row.height);
        this.$router.push({name: 'block-detail', query: { height: row.height }});
    },
    subID: function (row, column) {
      return row.id.slice(0,8);
    },

    subDelegate: function (row, column) {
      return row.delegate.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },
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

.el-card {
  margin-top: 20px;
}

/* row clickable */
.clickable-rows tbody tr td {
    cursor: pointer;
}

.clickable-rows .el-table__expanded-cell {
cursor: default;
}


</style>