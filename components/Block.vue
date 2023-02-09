<template>
  <b-card title="Latest Blocks" class="shadow mt-4">
    <el-table @row-click="blockRowClick" :data="blocks" stripe v-loading="blocksLoading">
      <el-table-column prop="height" align="center" label="Height" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}" :formatter="subID">
            {{table.row.height}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 500" prop="id" align="center" label="Block ID" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}" :formatter="subID">
            {{table.row.id.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto" :formatter="timestamp2date"></el-table-column>
      <el-table-column prop="delegate" align="center" label="Delegate" :formatter="subDelegate">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'delegate-detail', query: { publicKey: table.row.delegate }}">
            {{table.row.delegate.slice(0, 8)}}
           </nuxt-link>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <nuxt-link to="blocks">
      Explore more Blocks →
    </nuxt-link>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import { slots } from '@gny/utils';

export default {
  props: ['blocks', 'blocksLoading'],
  computed: {
    ...mapGetters(['width']),
  },
  methods: {
    blockRowClick: function (row) {
      this.$router.push({name: 'block-detail', query: { height: row.height }});
    },
    subID: function (row, column) {
      return row.id.slice(0,8);
    },
    subDelegate: function (row, column) {
      return row.delegate.slice(0,8);
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
