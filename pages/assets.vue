<template>
  <el-container>
    <b-card title="Assets" class="shadow">
      <el-table :data="currentAssets" stripe style="width: 100%; margin: auto;" height="500" v-loading="loading">
        <el-table-column prop="name" align="center" label="Name" width="110">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'asset-detail', query: { assetName: table.row.name }}">
              {{table.row.name}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="desc" align="center" label="Description" width="130"></el-table-column>
        <el-table-column prop="timestamp" align="center" label="Timestamp" width="180" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="leftToIssuePretty" align="center" label="Left To Issue" width="180"></el-table-column>
        <el-table-column prop="issuerId" align="center" label="Issuer" width="220" :formatter="subIssuerId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.issuerId }}">
              {{subIssuerId(table.row.issuerId)}}
            </nuxt-link>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="10"
          layout="prev, pager, next"
          :total="assetsCount"
          align="center"
        ></el-pagination>
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
      assets: [],
      assetsCount: 0,
      currentAssets: [],
      currentPage: 1,
      pageSize: 10,
      loaded: 0,
      loading: true,
    }
  },

  methods: {
    subTransactionId: function (row, column) {
      return row.tid.slice(0, 8);
    },

    subIssuerId: function (issuerId) {
      return issuerId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    makeAssetPretty: function(asset) {
      const prec = Math.pow(10, asset.precision);
      const difference = new BigNumber(asset.maximum)
        .minus(asset.quantity)
        .toFixed();

      const one = {
        tid: asset.tid,
        name: asset.name,
        precision: asset.precision,
        maximum: asset.maximum,
        maximumPretty: new BigNumber(asset.maximum).dividedBy(prec).toFixed(),
        quantity: asset.quantity,
        quantityPretty: new BigNumber(asset.quantity).dividedBy(prec).toFixed(),
        leftToIssue: difference,
        leftToIssuePretty: new BigNumber(difference).dividedBy(prec).toFixed(),
        desc: asset.desc,
        issuerId: asset.issuerId,
      };
      return one;
    },

    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.changePage(this.assets, currentPage);
    },

    changePage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize;
      let to = currentPage * this.pageSize;
      this.currentAssets = [];
      for (; from < to; from++) {
        if (list[from]) {
          this.currentAssets.push(list[from]);
        }
      }
    },
  },

  async mounted() {
    const result = (await connection.api.Uia.getAssets())
      .assets
      .map(x => this.makeAssetPretty(x));

    this.assets = result;

    this.assetsCount = this.assets.length;
    this.handleCurrentChange(1);

    if (this.assets.length > 0) {
      this.loading = false;
    }
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

</style>