<template>
  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table class="clickable-rows" :data="assets" stripe v-loading="loading">
      <el-table-column prop="currency" align="center" label="Currency" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'asset-detail', query: { assetName: table.row.currency } }">
            {{ table.row.currency }}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="balance" align="center" label="Balance" width="auto"
        :formatter="prettyPrintAssetAmount"></el-table-column>
      <el-table-column v-if="width > 600" prop="flag" align="center" label="Flag" width="auto"></el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="5"
      layout="prev, pager, next" :total="balancesCount" align="center"></el-pagination>
  </b-card>
</template>


<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import * as gnyClient from '@gny/client';



const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    ...mapGetters(['width']),
    formatTitle() {
      return 'Custom Assets ' + '(total: ' + this.balancesCount + ')';
    },
  },
  data() {
    return {
      loading: true,

      balances: [],
      balancesCount: 0,
      assets: [],

      currentPage: 1,
      pageSize: 5,
    };
  },
  props: {
    senderAddress: {
      required: true,
      type: String,
    }
  },

  watch: {
    senderAddress: async function (senderAddress) {
      console.log('(CustomAssets) address changed to ' + senderAddress);

      // reset
      this.balances = [];
      this.balancesCount = 0;
      this.assets = []

      if (senderAddress === undefined) {
        console.log(`(CustomAssets) senderAddress is "undefined"`);
        return;
      }

      await this.handleCurrentChange(1);
    },
  },

  methods: {
    handleCurrentChange: async function (currentPage) {
      this.loading = true;
      console.log(`(CustomAsset) load data for page "${currentPage}"`);

      const from = (currentPage - 1) * this.pageSize;

      const raw = await connection.api.Uia.getBalances(this.senderAddress, this.pageSize, from);
      this.balances = raw.balances;
      this.balancesCount = raw.count;

      console.log(`(CustomAssets) balances: ${JSON.stringify(this.balances, null, 2)}`);

      for (let i = 0; i < this.balances.length; i++) {
        const currency = this.balances[i].currency;
        console.log(`currenty: ${currency}`);
        let one = null;
        try {
          one = (await connection.api.Uia.getAsset(currency)).asset;
        } catch (err) {
          console.log(`(CustomAssets) err.message: ${err.message}`);
        }
        const precision = one.precision;

        this.assets.push({
          ...this.balances[i],
          precision: precision
        });
      }

      this.loading = false;
    },
    prettyPrintAssetAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      return new BigNumber(row.balance).dividedBy(prec).toFixed();
    },
  },

};

</script>