<template>
  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table :data="delegates" stripe v-loading="loading">

      <el-table-column prop="rate" align="center" label="Rank" width="auto"></el-table-column>

      <el-table-column prop="username" align="center" label="Delegate">
        <template v-slot:default="table" width="auto">
            <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: table.row.username }}">{{ table.row.username }}</nuxt-link>
          </template>
      </el-table-column>

      <el-table-column v-if="width >= 500" prop="producedBlocks" align="center" label="Produced Blocks" width="auto"></el-table-column>
      <el-table-column v-if="width >= 800" prop="missedBlocks" align="center" label="Missed Blocks" width="auto"></el-table-column>
      <el-table-column v-if="width >= 1200" prop="votes" align="center" label="Overall Vote Weight (GNY)" :formatter="voteWeightFormatter" width="200"></el-table-column>
      <el-table-column v-if="width >= 1000" prop="approval" align="center" label="Approval" width="auto"></el-table-column>

    </el-table>

    <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="5"
        layout="prev, pager, next"
        :total="delegatesCount"
        align="center"
      ></el-pagination>
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
    formatTitle() {
      return `Who I Voted For (total: ${this.delegatesCount})`;
    },
    ...mapGetters(['width']),
  },
  props: {
    addressOfVoter: {
      required: true,
      type: String,
    }
  },
  data() {
    return {
      loading: true,
      currentPage: 1,
      pageSize: 5,
      delegates: [],
      delegatesCount: 0,
    };
  },
  watch: { 
    addressOfVoter: async function(address) {
      console.log(`(WhoIVotedFor) address of voter changed to "${address}"`);

      // reset delegates and delegatesCount because if error occurs while
      // loading new data we don't want that the old data is visible
      // better no data then wrong data
      this.delegates = [];
      this.delegatesCount = 0;

      if (this.addressOfVoter === null || this.addressOfVoter === undefined || this.addressOfVoter === '') {
        return;
      }

      await this.handleCurrentChange(1);
    },
  },
  methods: {
    voteWeightFormatter: function (row, column) {
      return new BigNumber(row.votes).dividedBy(1e8).toFixed();
    },
    handleCurrentChange: async function(currentPage) {
      this.loading = true;

      const from = (currentPage - 1) * this.pageSize;
      const query = {
          address: this.addressOfVoter,
      };
      console.log(JSON.stringify(query, null, 2));
      console.log(`delegatescount: ${this.delegatesCount}`);

      let result = [];
      // this endpoint is not paged because it can only return up to 101
      // of own votes
      // when voting one can only vote for up to 33 delegates at one time
      // then it
      const raw = await connection.api.Delegate.getOwnVotes(query);
      if (raw.success === true) {
        result = raw.delegates;
      }

      for (let i = 0; i < result.length; ++i) {
        const one = result[i];
        if (!one.rate) {
          one.rate = 0;
        }
      }

      const paged = result.slice(from, from + this.pageSize);
      this.delegates = paged;
      this.delegatesCount = result.length;
      console.log(`delegatescount: ${this.delegatesCount}`);

      this.loading = false;
    },

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
