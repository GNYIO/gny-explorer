<template>
  <b-card title="Burnings" class="shadow">
    <el-table :data="burn" stripe height="500" v-loading="loading">
      <el-table-column prop="amount" align="center" label="Amount" :formatter="formatAmount"></el-table-column>
      <el-table-column v-if="width > 300" width="65" prop="height" align="center" label="Height"></el-table-column>
      <el-table-column v-if="width > 450" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
            {{table.row.senderId.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="tid" align="center" width="auto" label="Transaction ID">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
            {{table.row.tid.slice(0,8)}}
          </nuxt-link>
        </template>
      </el-table-column>

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
import * as gnyClient from '@gny/client';
import { BigNumber } from 'bignumber.js';

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
  data() {
    return {
      burn: [],
      offset: 0,
      loaded: 0,
      loading: true,
    };
  },
  methods: {
    infiniteHandler: function ($state) {
      console.log('infiniteHandler');

      setTimeout(async () => {
        this.offset = this.loaded;

        console.log('offset', this.offset);
   
        try {
          const burn = (await connection.api.Burn.getAll(this.limit, this.offset)).burn;
          console.log(JSON.stringify(burn, null, 2));

          this.burn.push(...burn);

          if (this.burn.length >= 0) {
            this.loading = false;
          }

          this.loaded += burn.length;
          $state.loaded();
          if (burn.length === 0) {
            $state.complete();
          }
        } catch (error) {
          console.log(error.message);
          $state.complete();
        }
      }, 100);
    },
    formatAmount: function (row, column) {
      return new BigNumber(row.amount).dividedBy(1e8).toFixed() + ' GNY';
    },
    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },
  },
};
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