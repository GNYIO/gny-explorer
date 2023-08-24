<template>
  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table class="clickable-rows" :data="burnings" stripe v-loading="loading">
      <el-table-column prop="amount" align="center" label="Amount" :formatter="formatAmount"></el-table-column>
      <el-table-column v-if="width > 300" width="75" prop="height" align="center" label="Height"></el-table-column>
      <el-table-column prop="tid" align="center" width="auto" label="Transaction ID">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.tid }}">
            {{table.row.tid.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="5"
      layout="prev, pager, next" :total="burningsCount" align="center"></el-pagination>
  </b-card>
</template>


<script>
import { mapGetters } from 'vuex';
import * as gnyClient from '@gny/client';
import BigNumber from 'bignumber.js';



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
      return 'My GNY Burnings ' + '(total: ' + this.burningsCount + ')';
    },
  },
  data() {
    return {
      loading: true,

      burnings: [],
      burningsCount: 0,
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
      console.log(`(Burnings) address changed to "${this.senderAddress}"`);

      // reset
      this.burnings = [];
      this.burningsCount = 0;
      this.assets = []

      if (this.senderAddress === null || this.senderAddress === undefined || this.senderAddress === '') {
        console.log(`(Burnings) senderAddress is "undefined"`);
        return;
      }

      await this.handleCurrentChange(1);
    },
  },

  methods: {
    handleCurrentChange: async function (currentPage) {
      this.loading = true;
      console.log(`(CustomAssets) load data for page "${currentPage}"`);

      const from = (currentPage - 1) * this.pageSize;

      const raw = await connection.api.Burn.getAll(this.pageSize, from, this.senderAddress);
      this.burnings = raw.burn;
      this.burningsCount = raw.count;

      console.log(`(Burnings) burnings: ${JSON.stringify(this.burnings, null, 2)}`);

      this.loading = false;
    },
    formatAmount: function (row, column) {
      return new BigNumber(row.amount).dividedBy(1e8).toFixed() + ' GNY';
    },
  },

};

</script>