<template>
  <el-container>
    <b-card title="Blocks" class="shadow">
      <el-table :data="blocks" stripe style="width: 100%; margin: auto;" height="500" v-loading="loading">
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
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="170" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="count" align="center" label="Transactions" width="110"></el-table-column>
        <el-table-column prop="fees" align="center" label="Fees" width="130" :formatter="formatFees"></el-table-column>
        <el-table-column prop="reward" align="center" label="Reward" width="90" :formatter="formatReward"> </el-table-column>
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
          <div slot="no-more"></div>
        </infinite-loading>

      </el-table>
    </b-card>
  </el-container>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
import { BigNumber } from 'bignumber.js';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  data() {
    return {
      blocks: [],
      limit: 50,
      offset: 0,
      loaded: 0,
      loading: true,
      orderBy: 'height:desc',
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

    formatReward: function (row, column) {
      return new BigNumber(row.reward).dividedBy(1e8).toFixed();
    },

    formatFees: function (row, column) {
      BigNumber.set({ DECIMAL_PLACES: 2 });
      return new BigNumber(row.fees).dividedBy(1e8).toFixed();
    },

    infiniteHandler: function ($state) {
      setTimeout(async () => {
        this.offset = this.loaded;

        console.log('offset', this.offset);
   
        try {
          const newBlocks = (await connection.api.Block.getBlocks(this.offset, this.limit, this.orderBy)).blocks;
          this.blocks.push(...newBlocks);

          if (this.blocks.length >= 0) {
            this.loading = false;
          }

          this.loaded += newBlocks.length;
          $state.loaded();
          if (newBlocks.length === 0) {
            $state.complete();
          }
        } catch (error) {
          console.log(error.message);
          $state.complete();
        }
        
      }, 100);
    },
  },

  async mounted() {
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