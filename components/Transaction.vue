<template>
  <el-card>
    <h2>Latest transactions</h2>
    <el-table class="clickable-rows" @row-click="rowClick" :data="transactions" stripe style="width: 95%; margin: auto;">
      <el-table-column prop="height" align="center" label="Height" width="150"></el-table-column>
      <el-table-column prop="id" align="center" label="Transaction ID" width="200">
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
    </el-table>
  </el-card>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS'],
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
  },
  data() {
    return {
      transactions: null,
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
  },
}
</script>

<style scoped>
.el-card {
  margin-top: 20px;
}

.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}

/* row clickable */
.clickable-rows tbody tr td {
  cursor: pointer;
}

.clickable-rows .el-table__expanded-cell {
  cursor: default;
}
</style>