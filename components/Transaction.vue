<template>
  <b-card title="Latest Transactions" class="shadow mt-4">
    <el-table :data="transactions" stripe style="width: 95%; margin: auto;" v-loading="loading">
      <el-table-column prop="id" align="center" label="Transaction ID">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
            {{table.row.id.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="height" align="center" label="Block Height" width="150">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
            {{table.row.height}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
      <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}" tag="span">
            <div>{{table.row.senderId.slice(0,8)}}</div>
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <nuxt-link to="transactions">
      Explore more Transactions →
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
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  methods: {
    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },
  },
  data() {
    return {
      transactions: null,
      loading: true,
    }
  },

  async mounted() {
    const limit = 5;
    const offset = 0;
    const orderBy = 'height:desc';
    const result = (await connection.api.Transaction.getTransactions({
      limit,
      offset,
      orderBy,
    })).transactions;

    this.transactions = result;
    if (this.transactions.length > 0) {
      this.loading = false;
    }
  },
}
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>