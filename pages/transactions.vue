<template>
  <el-container>
    <el-card>
      <h2>Transactions</h2>
      <el-table class="clickable-rows" @row-click="rowClick" :data="transactions" stripe style="width: 100%; margin: auto;" height="500">
        <el-table-column prop="height" align="center" width="150" label="Height"></el-table-column>
        <el-table-column prop="id" align="center" width="230" label="Transaction ID">
          <template v-slot:default="table">
            <el-tooltip content="Bottom center" placement="bottom" effect="light">
              <div slot="content">{{table.row.id}}</div>
              <router-link :to="{name: 'transaction', query: { id: table.row.id }}" tag="span">
                {{table.row.id.slice(0,8)}}
              </router-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
          <template v-slot:default="table">
            <el-tooltip content="Bottom center" placement="bottom" effect="light">
              <div slot="content">{{table.row.senderId}}</div>
              <div>{{table.row.senderId.slice(0,8)}}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="Fee"></el-table-column>

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
  process.env['GNY_HTTPS']|| false,
);

export default {
  methods: {
    rowClick: function(row) {
      console.log(row.id);
      this.$router.push({name: 'transaction', query: { id: row.id }});
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    infiniteHandler: async function ($state) {
      const limit = 10;
      const offset = this.loaded;
      const orderBy = 'height:desc'
      const newTransactions = (await connection.api.Transaction.getTransactions({
        limit,
        offset,
      })).transactions
      await this.$store.dispatch('appendTransactions', newTransactions);
      this.transactions = this.$store.state.transactions
      this.loaded += limit;
      $state.loaded()
      if (newTransactions.length === 0) {
        $state.complete();
      }
    },
  },
  data() {
    return {
      transactions: [],
      loaded: 0,
    }
  },

  async mounted() {
    const limit = 10;
    const offset = 0;
    const result = (await connection.api.Transaction.getTransactions({
      limit,
      offset,
    })).transactions;

    this.transactions = result;
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
