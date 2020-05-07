<template>
  <el-container>
    <el-card>
      <h2>Assets</h2>
      <el-table @row-click="rowClick" class="clickable-rows" :data="assets" stripe style="width: 100%; margin: auto;" height="500">
        <el-table-column prop="name" align="center" label="Name" width="110"></el-table-column>
        <el-table-column prop="desc" align="center" label="Description" width="130"></el-table-column>
        <el-table-column prop="tid" align="center" label="TransactionId" width="120" :formatter="subTransactionId"></el-table-column>
        <el-table-column prop="timestamp" align="center" label="Timestamp" width="180" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="precision" align="center" label="Precision" width="90"></el-table-column>
        <el-table-column prop="quantity" align="center" label="Quantity"></el-table-column>
        <el-table-column prop="issuerId" align="center" label="Issuer" width="120" :formatter="subIssuerId"></el-table-column>

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
      assets: [],
      loaded: 0,
    }
  },

  methods: {
    rowClick: function(row) {
      this.$router.push({name: 'asset-detail', query: { assetName: row.name }});
    },

    subID: function (row, column) {
      return row.id.slice(0,8);
    },

    subTransactionId: function (row, column) {
      return row.tid.slice(0, 8);
    },

    subIssuerId: function (row, column) {
      return row.issuerId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    infiniteHandler: function ($state) {
      setTimeout(async () => {
        const limit = 10;
        const offset = this.loaded;

        console.log(`infiniteHandler(): limit ${limit}, offset: ${offset}`);

        const newAssets = (await connection.api.Uia.getAssets(limit, offset)).assets;
        this.assets.push(...newAssets);

        this.loaded += limit;
        $state.loaded();

        if (newAssets.length === 0) {
          $state.complete();
        }
      }, 1000)
    },
  },

  async mounted() {
    const limit = 10;
    const offset = 0;

    const result = (await connection.api.Uia.getAssets(limit, offset)).assets;
    this.assets = result;
    this.loaded = 10;
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

/* row clickable */
.clickable-rows tbody tr td {
    cursor: pointer;
}

.clickable-rows .el-table__expanded-cell {
    cursor: default;
}

</style>