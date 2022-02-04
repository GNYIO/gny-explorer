<template>
  <b-card title="Who I Voted For" class="shadow mt-4">
    <el-table :data="currentDelegates" style="width: 100%">

      <el-table-column prop="rate" align="center" label="Rank" width="70"></el-table-column>

      <el-table-column prop="username" align="center" label="Delegate">
        <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: table.row.username }}" tag="span">{{ table.row.username }}</nuxt-link>
          </template>
      </el-table-column>

      <el-table-column prop="producedBlocks" align="center" label="Produced Blocks"></el-table-column>
      <el-table-column prop="missedBlocks" align="center" label="Missed Blocks"></el-table-column>
      <el-table-column prop="votes" align="center" label="Overall Vote Weight (GNY)" :formatter="voteWeightFormatter" width="210"></el-table-column>
      <el-table-column prop="approval" align="center" label="Approval"></el-table-column>

    </el-table>

    <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="5"
        layout="prev, pager, next"
        :total="delegateCount"
        align="center"
      ></el-pagination>
  </b-card>
</template>


<script>
import * as gnyClient from '@gny/client';
import { BigNumber } from 'bignumber.js';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  props: {
    addressOfVoter: {
      required: true,
      type: String,
    }
  },
  data() {
    return {
      currentPage: 1,
      delegateCount: 0,
      pageSize: 5,
      delegates: [],
      currentDelegates: [],
    };
  },
  watch: { 
    addressOfVoter: async function(address) {
      console.log('address of voter changed to ' + address);
      await this.loadDataFor(address);
    },
  },
  methods: {
    async loadDataFor(address, username) {
      let delegates = null;

      if (address != null) {
        const result = await connection.api.Delegate.getOwnVotes({
          address,
        });
        if (result.success === true) {
          delegates = result.delegates;
        }
      }

      for (let i = 0; i < delegates.length; ++i) {
        const one = delegates[i];
        if (!one.rate) {
          one.rate = 0;
        }
      }
      this.delegates = delegates;
      this.delegateCount = delegates.length;

      this.handleCurrentChange(1);
    },
    voteWeightFormatter: function (row, column) {
      return new BigNumber(row.votes).dividedBy(1e8).toFixed();
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.changePage(this.delegates, currentPage);
    },
    changePage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize;
      let to = currentPage * this.pageSize;
      this.currentDelegates = [];
      for (; from < to; from++) {
        if (list[from]) {
          this.currentDelegates.push(list[from]);
        }
      }
    }
  },  
}
</script>

<style scoped>
.el-card {
  margin-top: 20px;
}
</style>
