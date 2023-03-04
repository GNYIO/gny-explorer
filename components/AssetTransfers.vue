<template>
  <!--Asset Transfers-->
  <b-card :title="formatTitle" class="shadow mt-4">

    <el-table :data="transfers" style="width: 100%" v-loading="loading">

      <el-table-column prop="amount" align="center" label="Amount" :formatter="prettyPrintAmount"
        width="auto"></el-table-column>

      <el-table-column v-if="width >= 500" prop="currency" align="center" label="Currency" width="auto">
        <template v-slot:default="table">
          <span v-if="table.row.currency === 'GNY'">GNY</span>
          <nuxt-link v-else class="nuxt-link" :to="{ name: 'asset-detail', query: { assetName: table.row.currency } }">{{
            table.row.currency }}</nuxt-link>
        </template>
      </el-table-column>

      <el-table-column v-if="width >= 500" prop="senderId" label="Sender" align="center" width="auto">
        <template v-slot:default="table">
          <span v-if="senderAddress === table.row.senderId">ME</span>
          <nuxt-link v-else class="nuxt-link" :to="{ name: 'account-detail', query: { address: table.row.senderId } }">
            {{ table.row.senderId.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column v-if="width >= 500" prop="recipientId" label="Recipient" align="center" width="auto">
        <template v-slot:default="table">
          <span v-if="senderAddress === table.row.recipientId">ME</span>
          <nuxt-link v-else class="nuxt-link" :to="{ name: 'account-detail', query: { address: table.row.recipientId } }">
            {{ table.row.recipientId.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column prop="tid" align="center" label="TX ID" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.tid } }">
            {{ table.row.tid.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column v-if="width >= 800" prop="height" align="center" label="Height" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: table.row.height } }">
            {{ table.row.height }}
          </nuxt-link>
        </template>
      </el-table-column>

    </el-table>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="5"
      layout="prev, pager, next"
      :total="transfersCount"
      align="center">
    </el-pagination>

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
      return 'Asset Transfers ' + '(total: ' + this.transfersCount + ')';
    },
  },
  data() {
    return {
      loading: true,
      currentPage: 1,
      pageSize: 5,

      transfers: [],
      transfersCount: 0,
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
      console.log('(AssetTransfers) address changed to ' + senderAddress);

      // reset
      this.transfers = [];
      this.transfersCount = 0;

      if (this.senderAddress === null || this.senderAddress === undefined) {
        return;
      }

      await this.handleCurrentChange(1);
    },
  },
  methods: {
    handleCurrentChange: async function (currentPage) {
      this.loading = true;
      console.log(`(AssetTransfers) load data for page "${currentPage}"`);

      const from = (currentPage - 1) * this.pageSize;
      const query = {
        ownerId: this.senderAddress,
        limit: this.pageSize,
        offset: from,
      };
      console.log(`(AssetTransfers) ${JSON.stringify(query, null, 2)}`);

      const transfersResult = await connection.api.Transfer.getRoot(query);

      
      // get asset names from downloaded transfers
      const allAssets = transfersResult.transfers.map(x => x.currency);
      const allAssetsNoDuplicates = [...new Set(allAssets)]; // remove duplicates
      
      const assets = [];
      for (let i = 0; i < allAssetsNoDuplicates.length; ++i) {
        if (allAssetsNoDuplicates[i] === 'GNY') {
          continue;
        }
        const asset = (await connection.api.Uia.getAsset(allAssetsNoDuplicates[i])).asset;
        assets.push(asset);
      }

      this.transfersCount = transfersResult.count;
      // add precision to every transfer item
      this.transfers = transfersResult.transfers.map(trans => {
        if (trans.currency === 'GNY') {
          trans.precision = 8;
        } else {
          const customAssetPrecision = assets.filter(oneAsset => {
            return oneAsset.name === trans.currency;
          })[0].precision;
          trans.precision = customAssetPrecision;
        }
        return trans;
      });

      this.loading = false;
    },
    prettyPrintAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      return new BigNumber(row.amount).dividedBy(prec).toFixed();
    },
  }
};

</script>