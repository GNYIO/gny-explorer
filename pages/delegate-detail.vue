<template>
  <el-container direction="vertical">
    <b-card title="Delegate" class="shadow">
      <el-row>
        <el-col :span="8" >
          Username
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { username: delegate.username }}">{{delegate.username}}</nuxt-link>
          </p>
        </el-col>
        <el-col :span="8" >
          Public Key
          <p>{{publicKey.slice(0,8)}}</p>
        </el-col>
        <el-col :span="8" >
          Address
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: delegate.address }}">{{delegate.address}}</nuxt-link>
          </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8" >
          Produced Blocks
          <p >{{delegate.producedBlocks}}</p>
        </el-col>
        <el-col :span="8" >
          Missed Blocks
          <p >{{delegate.missedBlocks}}</p>
        </el-col>
        <el-col :span="8" >
          Rewards
          <p >{{rewards}} GNY</p>
        </el-col>
      </el-row>

      <el-row>
          <el-col :span="8">
              Rank
              <p># {{delegate.rate}}</p>
          </el-col>
          <el-col :span="8">
              Approval
              <p>{{delegate.approval}} %</p>
          </el-col>
          <el-col :span="8">
              Productivity
              <p>{{delegate.productivity}} %</p>
          </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="24">
          Registration Transaction
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: delegate.tid }}">
              {{trs}}
            </nuxt-link>
          </p>
        </el-col>
      </el-row>
    </b-card>

    <b-card :title="blockTitle" class="shadow mt-4">
      <el-table :data="currentBlocks" stripe style="width: 100%; margin: auto;" v-loading="loading">
        <el-table-column prop="height" align="center" label="Height" width="80">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="id" align="center" label="Block ID" width="100">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{subID(table.row.id)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="170" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="count" align="center" label="Transactions" width="110"></el-table-column>
        <el-table-column prop="fees" align="center" label="Fees" width="130" :formatter="formatFees"></el-table-column>
        <el-table-column prop="reward" align="center" label="Reward" width="90" :formatter="formatReward"> </el-table-column>
        <el-table-column prop="delegate" align="center" label="Delegate" width="150">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'delegate-detail', query: { publicKey: table.row.delegate }}">
              {{subDelegate(table.row.delegate)}}
            </nuxt-link>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="10"
        layout="prev, pager, next"
        :total="blocksCount"
        align="center"
      ></el-pagination>
    </b-card>

    <b-card title="Voters" class="shadow mt-4">
      <el-table :data="voters" stripe style="width: 100%; margin: auto;" v-loading="voteLoading">
        <el-table-column prop="senderId" align="center" label="Address">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0, 8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="lockAmount" align="center" label="Lock Amount" :formatter="formatLockAmount"></el-table-column>
        <el-table-column prop="transactionId" align="center" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.transactionId }}">
              {{table.row.transactionId.slice(0, 8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
      </el-table>
    </b-card>

    <who-i-voted-for-component :addressOfVoter="address"></who-i-voted-for-component>

  </el-container>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
import BigNumber from 'bignumber.js';
import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';


const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  components: {
    'who-i-voted-for-component': WhoIVotedForComponent,
  },
  watch: { 
    '$route.query.username': async function(username) {
      await this.updatePage(username, null);
    },

    '$route.query.publicKey': async function(publicKey) {
      await this.updatePage(null, publicKey);
    }
  },

  data() {
    return {
      address: '',
      delegate: {},
      publicKey: '',
      username: '',
      trs: '',
      rewards: '',
      blocks: [],
      blocksCount: 0,
      offset: 0,
      loading: true,
      currentBlocks: [],
      currentPage: 1,
      pageSize: 10,
      blockTitle:'',
      voters: [],
      voteLoading: true,
    }
  },

  methods: {
    subID: function (id) {
      return id.slice(0,8);
    },

    subDelegate: function (delegate) {
      return delegate.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    formatReward: function (row, column) {
      return new BigNumber(row.reward).dividedBy(1e8).toFixed();
    },

    formatFees: function (row, column) {
      return new BigNumber(row.fees).dividedBy(1e8).toFixed();
    },

    formatLockAmount: function (row, column) {
      return new BigNumber(row.lockAmount).dividedBy(1e8).toFixed();
    },
    
    updatePage: async function (username, publicKey) {
      try {
        let delegate = null;
        if (username) {
          const result = await connection.api.Delegate.getDelegateByUsername(username);
          if (result.success) {
            delegate = result.delegate;
          }
        }

        if (publicKey) {
          const result = await connection.api.Delegate.getDelegateByPubKey(publicKey);
          if (result.success) {
              delegate = result.delegate;
          }
        }

        delegate.approval = new BigNumber(delegate.approval).decimalPlaces(4).toFixed();
        delegate.productivity = new BigNumber(delegate.productivity).times(100).decimalPlaces(4).toFixed();

        console.log(`delegate: ${JSON.stringify(delegate, null, 2)}`);
        this.delegate = delegate;
        this.address = delegate.address;
        this.publicKey = delegate.publicKey;
        this.trs = delegate.tid.slice(0, 8);
        this.rewards = new BigNumber(delegate.rewards).dividedBy(1e8).toFixed();
        this.blockTitle = 'Produced Blocks ' + '(total: ' + delegate.producedBlocks + ')';
        this.blocksCount = new BigNumber(delegate.producedBlocks).toNumber();

        const query = {
          offset: this.offset,
          publicKey: this.publicKey,
        }

        this.blocks = (await connection.api.Delegate.ownProducedBlocks(query)).blocks;

        if (this.blocks.length >= 0) {
            this.loading = false;
        }

        const voterAccounts = (await connection.api.Delegate.getVoters(this.delegate.username)).accounts;

        for (let i = 0; i < voterAccounts.length; ++i) {
          const voter = await this.getVoterInfo(voterAccounts[i]);
          this.voters.push(voter);
        }

        if (this.voters.length >= 0) {
            this.voteLoading = false;
        }
      } catch (error) {
        console.log(`error(delegate-detail): ${JSON.stringify(error && error.response && error.response.data, null, 2)}`);
        error({ statusCode: 404, message: 'Oops...' })
      }
    },

    getVoterInfo: async function (account) {
      let voter = {};
      const query = {
        senderId: account.address,
        type: 4,
      }
      const transactions =  (await connection.api.Transaction.getTransactions(query)).transactions;

      for (let i = 0; i < transactions.length; ++i) {
        const voteList = transactions[i].args;
        if (voteList.includes(this.delegate.username)) {
          voter['transactionId'] = transactions[i].id;
          voter['height'] = transactions[i].height;
          voter['senderId'] = transactions[i].senderId;
          voter['lockAmount'] = account.lockAmount;

          return voter;
        }
      }
    },

    handleCurrentChange: async function (currentPage) {
      this.currentPage = currentPage;
      const currentFrom = (currentPage - 1) * this.pageSize;
      while (currentFrom > this.blocks.length) {
        const offset = this.blocks.length;
        const query = {
          offset: offset,
          publicKey: this.publicKey,
        }
        const newBlocks = (await connection.api.Delegate.ownProducedBlocks(query)).blocks;
        this.blocks = this.blocks.concat(newBlocks);
      }
      this.changePage(this.blocks, currentPage);
    },

    changePage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize;
      let to = currentPage * this.pageSize;
      this.currentBlocks = [];
      for (; from < to; from++) {
        if (list[from]) {
          this.currentBlocks.push(list[from]);
        }
      }
    },
  },

  computed: {
    formatTitle() {
      return 'Produced Blocks ' + '(total: ' + this.blocksCount + ')';
    }
  },

  async mounted() {
    if (this.$route.query.hasOwnProperty('username')) {
      this.username = this.$route.query.username;
    }

    if (this.$route.query.hasOwnProperty('publicKey')) {
      this.publicKey = this.$route.query.publicKey;
    }
    
    await this.updatePage(this.username, this.publicKey);
    await this.handleCurrentChange(1);
  }
};

</script>

<style scoped>
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>