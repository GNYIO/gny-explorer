<template>
  <el-container>
    <el-card>
      <h2>GNY blocks</h2>
      <el-table :data="blocks" stripe style="width: 100%; margin: auto;" height="500">
        <el-table-column prop="height" align="center" label="Height" width="80"></el-table-column>
        <el-table-column prop="id" align="center" label="Block ID" width="100" :formatter="subID"></el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="count" align="center" label="Transactions" width="120"></el-table-column>
        <el-table-column prop="fees" align="center" label="Fees" width="100"></el-table-column>
        <el-table-column prop="reward" align="center" label="Reward" width="100"></el-table-column>
        <el-table-column prop="delegate" align="center" label="Delegate" :formatter="subDelegate" width="150"></el-table-column>
        
        <infinite-loading
          slot="append"
          @infinite="infiniteHandler"
          force-use-infinite-wrapper=".el-table__body-wrapper">
        </infinite-loading>

      </el-table>
    </el-card>
  </el-container>
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
      loaded: 0,
    }
  },

  methods: {
    subID: function (row, column) {
      return row.id.slice(0,8);
    },

    subDelegate: function (row, column) {
      return row.delegate.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    infiniteHandler: function ($state) {
      setTimeout(async () => {
        console.log('Loading more blocks...');
        const limit = 10;
        const offset = this.loaded;
        const orderBy = 'height:desc';

        const newBlocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;

        await this.$store.dispatch('appendBlocks', newBlocks);
        this.blocks = this.$store.state.blocks;

        this.loaded += limit;
        $state.loaded();
      }, 1000)
    },
  },

  async mounted() {
    const limit = 10;
    const offset = 0;
    const orderBy = 'height:desc';

    this.blocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;
    this.loaded = 10;
    await this.$store.dispatch('setBlocks', this.blocks);
  },
}
</script>

<style>

.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}

.el-card {
  margin-top: 20px;
}

</style>