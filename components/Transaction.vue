<template>
  <b-card title="Latest Transactions" class="shadow mt-4">
    <el-table :data="latestTransactions" stripe style="width: 95%; margin: auto;" v-loading="transLoading">
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
import { slots } from '@gny/utils';

export default {
  props: ['latestTransactions', 'transLoading'],

  methods: {
    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },
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