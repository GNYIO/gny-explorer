<template>
    <b-card title="Transactions" class="shadow">
      <el-table :data="transactions" stripe height="500" v-loading="loading">
        <el-table-column prop="id" align="center" width="auto" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width > 1050" prop="timestamp" align="center" label="Forged Time" width="165" :formatter="timestamp2date"></el-table-column>
        <el-table-column v-if="width > 450" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width > 800" prop="fee" label="Fee" align="center" width="auto" :formatter="formatFee"></el-table-column>
        <el-table-column v-if="width > 600" prop="type" label="Type" align="center" width="auto" :formatter="formatType"></el-table-column>

        <infinite-loading
          slot="append"
          @infinite="infiniteHandler"
          force-use-infinite-wrapper=".el-table__body-wrapper">
          <div slot="no-more"></div>
        </infinite-loading>
      </el-table>

    </b-card>
</template>


<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
import { contractMappingFilter } from '../helpers/getTransactionType';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    ...mapGetters(['width']),
  },
  methods: {
    rowClick: function(row) {
      console.log(row.id);
      this.$router.push({name: 'transaction-detail', query: { id: row.id }});
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
    },

    formatFee: function (row, column) {
      return new BigNumber(row.fee).dividedBy(1e8).toFixed();
    },

    formatType: function (row, column) {
      return contractMappingFilter(row.type);
    },

    infiniteHandler: function ($state) {
      setTimeout(async () => {
        if (this.count === 0) {
          this.count = (await connection.api.Transaction.getTransactions({offset})).count;
        }
        const limit = 50;
        const offset = this.count - this.loaded - limit;
        const newTransactions = (await connection.api.Transaction.getTransactions({
          limit,
          offset,
        })).transactions.reverse();
        this.transactions.push(...newTransactions);
        this.loaded += limit;
        $state.loaded()
        
        if (this.transactions.length >= 0) {
          this.loading = false;
        }

        if (newTransactions.length === 0) {
          $state.complete();
        }
      }, 100);
    },
  },
  data() {
    return {
      transactions: [],
      count: 0,
      loaded: 0,
      loading: true
    }
  },

  async mounted() {
  },
}
</script>


<style scoped>
.el-card {
  margin-top: 20px;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

</style>
