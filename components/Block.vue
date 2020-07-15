<template>
  <b-card title="Latest Blocks" class="shadow mt-4">
    <el-table :data="blocks" stripe style="width: 95%; margin: auto;">
      <el-table-column prop="height" align="center" label="Height" width="150">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}" tag="span" :formatter="subID">
            {{table.row.height}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="id" align="center" label="Block ID" width="200">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}" tag="span" :formatter="subID">
            {{table.row.id.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
      <el-table-column prop="delegate" align="center" label="Delegate" :formatter="subDelegate">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'delegate-detail', query: { publicKey: table.row.delegate }}" tag="span">
            {{table.row.delegate.slice(0, 8)}}
           </nuxt-link>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <nuxt-link to="blocks">
      Explore more Blocks →
    </nuxt-link>
  </b-card>
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
  },

  async mounted() {
    const limit = 5;
    const offset = 0;
    const orderBy = 'height:desc';

    this.blocks = (await connection.api.Block.getBlocks(offset, limit, orderBy)).blocks;
  },
}
</script>

<style scoped>
.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>
