<template>
    <b-card :title="formatTitle" class="shadow mt-4">

    <el-table :data="transactions" stripe @row-click="transactionRowClick">
        <el-table-column prop="height" align="center" label="Height" width="auto">
          <template v-slot:default="table">
             <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="id" align="center" label="Transaction ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 1000" prop="timestamp" align="center" label="Forged Time" :formatter="timestamp2date" width="155"></el-table-column>
        <el-table-column v-if="width >= 800" prop="senderId" align="center" label="Sender" width="150">
          <template v-slot:default="table">
            <!-- should be always ME -->
            <span v-if="senderAddress === table.row.senderId">ME</span>
            <span v-else>{{ table.row.senderId.slice(0,8) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="fee" align="center"  label="Fee" :formatter="formatFee" width="100"></el-table-column>
        <el-table-column v-if="width >= 1000" prop="type" align="center"  label="Type" :formatter="formatType" width="auto"></el-table-column>
      </el-table>

      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="5"
        layout="prev, pager, next"
        :total="transactionsCount"
        align="center"
      ></el-pagination>

</b-card>
</template>

<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import { contractMappingFilter } from '../helpers/getTransactionType';
import moment from 'moment';
import { slots } from '@gny/utils';


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
        return 'Transactions ' + '(total: ' + this.transactionsCount + ')';
      },
    },
    data() {
      return {
        loading: true,
        transactions: [],
        pageSize: 5,
        transactionsCount: 1,
        currentPage: 1,
      };
    },
    props: {
      senderAddress: {
        required: true,
        type: String,
      }
    },
    watch: { 
        senderAddress: async function(senderAddress) {
            console.log('(TransactionsISent) address of voter changed to ' + senderAddress);

            await this.handleCurrentChange(1);
        },
    },
    methods: {
        handleCurrentChange: async function (currentPage) {
            this.loading = true;

            const from = (currentPage - 1) * this.pageSize;
            const query = {
                limit: this.pageSize,
                offset: from,
                senderId: this.senderAddress,
            };
            
            console.log(JSON.stringify(query, null, 2));

            const raw = await connection.api.Transaction.getTransactions(query);
            this.transactionsCount = raw.count;

            console.log(`(TransactionsISent) length: ${raw.count}`);
            this.transactions = [];
            this.transactions = raw.transactions;
            
            this.loading = false;
        },
        formatFee: function (row, column) {
            return new BigNumber(row.fee).dividedBy(1e8).toFixed();
        },

        formatType: function (row, column) {
            return contractMappingFilter(row.type);
        },
        timestamp2date: function (row, column) {
            return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss');
        },
        transactionRowClick: function(row) {
            this.$router.push({name: 'transaction-detail', query: { id: row.id }});
        },
    }

};
</script>

<style scoped>
.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>