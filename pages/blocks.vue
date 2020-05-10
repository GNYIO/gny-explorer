<template>
  <el-container>
    <el-card>
      <h2>Blocks</h2>
      <el-table :data="blocks" stripe style="width: 100%; margin: auto;" height="500">
        <el-table-column prop="height" align="center" label="Height" width="80">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="id" align="center" label="Block ID" width="100">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{subID(table.row.id)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="count" align="center" label="Transactions" width="110"></el-table-column>
        <el-table-column prop="fees" align="center" label="Fees" width="70"></el-table-column>
        <el-table-column prop="reward" align="center" label="Reward" width="100"></el-table-column>
        <el-table-column prop="delegate" align="center" label="Delegate" width="150">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'delegate-detail', query: { publicKey: table.row.delegate }}">
              {{subDelegate(table.row.delegate)}}
            </nuxt-link>
          </template>
        </el-table-column>
        
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
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS'] || false,
);

export default {
  data() {
    return {
      blocks: [],
      loaded: 0,
    }
  },

  methods: {
    subID: function (id) {
      return id.slice(0,8);
    },

    subDelegate: function (delegate) {
      return delegate.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    infiniteHandler: function ($state) {
      setTimeout(async () => {
        const limit = 50;
        const offset = this.loaded;
        const orderBy = 'height:desc'
        const newBlocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks
        this.blocks.push(...newBlocks);
        this.loaded += limit;
        $state.loaded()
        if (newBlocks.length === 0) {
          $state.complete();
        }
      }, 100);
    },
  },

  async mounted() {
    const limit = 50;
    const offset = 0;
    const orderBy = 'height:desc';

    this.blocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;
    this.loaded = limit;
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

.el-card {
  margin-top: 20px;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

</style>