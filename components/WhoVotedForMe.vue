<template>

  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table :data="voters" stripe v-loading="loading">
      <el-table-column prop="senderId" align="center" label="Address">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
            {{table.row.senderId.slice(0, 8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column prop="lockAmount" align="center" label="Lock Amount" :formatter="formatLockAmount" width="auto"></el-table-column>
      <el-table-column v-if="width >= 800" prop="transactionId" align="center" label="Transaction ID" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.transactionId }}">
            {{table.row.transactionId.slice(0, 8)}}
          </nuxt-link>
        </template>
      </el-table-column>
      <el-table-column v-if="width >= 500" prop="height" align="center" label="Block Height" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
            {{table.row.height}}
          </nuxt-link>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="5"
        layout="prev, pager, next"
        :total="votersCount"
        align="center"
      ></el-pagination>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex';
import * as gnyClient from '@gny/client';
import BigNumber from 'bignumber.js';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    formatTitle() {
      return 'Who Voted For Me ' + '(total: ' + this.votersCount + ')';
    },
    ...mapGetters(['width']),
  },
  props: {
    votedForAddress: {
      required: true,
      type: String,
    }
  },
  data() {
    return {
      votedForUsername: '', // username of "votedForAddress" prop

      loading: true,
      currentPage: 1,
      pageSize: 5,
      voters: [],
      votersCount: 0,
    };
  },
  watch: { 
    votedForAddress: async function(address) {
      console.log(`(WhoVotedForMe) address of voter changed to "${address}"`);

      this.voters = [];
      this.votersCount = 0;
        
      if(this.votedForAddress === null || this.votedForAddress === undefined) {
        return;
      }

      const delegate = await connection.api.Delegate.getDelegateByAddress(this.votedForAddress);
      this.votedForUsername = delegate.delegate.username;
      console.log(`username: ${this.username}`);

      await this.handleCurrentChange(1);
    }
  },
  methods: {
    formatLockAmount: function (row, column) {
      return new BigNumber(row.lockAmount).dividedBy(1e8).toFixed();
    },
    
    handleCurrentChange: async function(currentPage) {
        let voterAccounts = (await connection.api.Delegate.getVoters(this.votedForUsername)).accounts;

        // page voterAccounts. take only as much as fit on one page
        const from = (currentPage - 1) * this.pageSize;
        voterAccounts = voterAccounts.slice(from, from + this.pageSize);

        const result = [];
        for (let i = 0; i < voterAccounts.length; ++i) {
          // get the actual transaction when for "me" was voted for
          const voter = await this.getVotingTransaction(voterAccounts[i]);
          result.push(voter);
        }

        this.voters = result.sort((a, b) => Number(a.height) < Number(b.height));
        this.votersCount = result.length;

        this.loading = false;
    },
    getVotingTransaction: async function (account) {
      let voter = {};
      // get all basic.vote transactions for this account that voted for "me"
      // because one can vote,unvote and then again vote for an account
      // we need to search for the last transaction
      let query = {
        senderId: account.address,
        type: 4,
        offset: 0,
        limit: 100,
      };
      
      // because someone could have more than 100 transactions
      // we should loop through all paged transactions
      let transactions = [];
      while (true) {
        const temp = await connection.api.Transaction.getTransactions(query);
        transactions.push(...temp.transactions);
        if (temp.count > transactions.length) {
            query.offset += 100;
        } else {
            break;
        }
      }
      transactions = transactions.reverse();

      
      console.log(`(WhoVotedForMe) fetched "${transactions.length}" vote transactions for voter "${account.address}"`);

      for (let i = 0; i < transactions.length; ++i) {
        const voteList = transactions[i].args;
        if (voteList.includes(this.votedForUsername)) {
          voter['transactionId'] = transactions[i].id;
          voter['height'] = transactions[i].height;
          voter['senderId'] = transactions[i].senderId;
          voter['lockAmount'] = account.lockAmount;

          return voter;
        }
      }
      
    },
  }
}

</script>
