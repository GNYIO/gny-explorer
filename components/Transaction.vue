<template>
  <b-card title="Latest Transactions" class="shadow mt-4">
    <el-table @row-click="transactionRowClick" :data="latestTransactions" stripe v-loading="transLoading">
      <el-table-column prop="id" align="center" label="TX ID" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
            {{table.row.id.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="height" align="center" label="Height" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
            {{table.row.height}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto" :formatter="timestamp2date"></el-table-column>
      <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
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
import { mapGetters } from 'vuex';
import moment from 'moment';
import { slots } from '@gny/utils';

export default {
  props: ['latestTransactions', 'transLoading'],
  computed: {
    ...mapGetters(['width']),
  },
  methods: {
    transactionRowClick: function(row) {
      this.$router.push({name: 'transaction-detail', query: { id: row.id }});
    },
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
.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>