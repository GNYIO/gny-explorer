<template>
  <div>
    <b-card title="Delegate" class="shadow">
      <div class="wrapper">
        <div>
          Username
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { username: delegate.username }}">{{delegate.username}}</nuxt-link>
          </p>
        </div>
        <div>
          Public Key
          <p>{{publicKey.slice(0,8)}}</p>
        </div>
        <div>
          Address
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: delegate.address }}">{{delegate.address}}</nuxt-link>
          </p>
        </div>
        <div>
          Produced Blocks
          <p>{{delegate.producedBlocks}}</p>
        </div>
        <div>
          Unlocked Balance
          <br v-if="prettyBalance === ''">
          <i v-if="prettyBalance === ''"  class="el-icon-loading"></i>
          <p>{{prettyBalance}} GNY</p>
        </div>
        <div>
          Locked Balance (voting weight)
          <br v-if="prettyLockBalance === ''">
          <i v-if="prettyLockBalance === ''"  class="el-icon-loading"></i>
          <p>{{prettyLockBalance}} GNY</p>
        </div>
        <div>
          Is Locked
          <p>{{isLocked}}</p>
        </div>
        <div >
          Lock Height
          <br v-if="lockHeight === ''">
          <i v-if="lockHeight === ''"  class="el-icon-loading"></i>
          <p>{{lockHeight}}</p>
        </div>
        <div>
          Missed Blocks
          <p >{{delegate.missedBlocks}}</p>
        </div>
        <div>
          Rewards
          <p >{{rewards}} GNY</p>
        </div>
         <div>
              Rank
              <p># {{delegate.rate}}</p>
          </div>
          <div>
              Approval
              <p>{{delegate.approval}} %</p>
          </div>
          <div>
              Productivity
              <p>{{delegate.productivity}} %</p>
          </div>
          <div>
          Registration Transaction
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: delegate.tid }}">
              {{trs}}
            </nuxt-link>
          </p>
          </div>
      </div>
    </b-card>

    <b-card :title="blockTitle" class="shadow mt-4">
      <el-table :data="currentBlocks" stripe v-loading="loading">
        <el-table-column prop="height" align="center" label="Height" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="id" align="center" label="Block ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{subID(table.row.id)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 1200" prop="timestamp" align="center" label="Forged Time" :formatter="timestamp2date" width="160"></el-table-column>
        <el-table-column v-if="width >= 800" prop="count" align="center" label="Transactions" width="auto"></el-table-column>
        <el-table-column v-if="width >= 800" prop="fees" align="center" label="Fees" :formatter="formatFees" width="70"></el-table-column>
        <el-table-column v-if="width >= 800" prop="reward" align="center" label="Reward" :formatter="formatReward" width="75"> </el-table-column>
        <el-table-column v-if="width >= 500" prop="delegate" align="center" label="Delegate" width="auto">
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

    <who-voted-for-me-component :votedForAddress="address"></who-voted-for-me-component>

    <who-i-voted-for-component :addressOfVoter="address"></who-i-voted-for-component>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
import BigNumber from 'bignumber.js';

import WhoVotedForMeComponent from '../components/WhoVotedForMe.vue';
import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';


const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  components: {
    'who-voted-for-me-component': WhoVotedForMeComponent,
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
      blocksCount: 0,
      offset: 0,
      loading: true,
      currentBlocks: [],
      currentPage: 1,
      pageSize: 10,
      blockTitle:'',
      prettyBalance: '',
      prettyLockBalance: '',
      isLocked: false,
      lockHeight: '',
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
      return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
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
        };

        const account = await connection.api.Account.getAccountByAddress(delegate.address);
        this.prettyBalance = new BigNumber(account.gny).dividedBy(1e8).toFixed(0);
        this.prettyLockBalance = new BigNumber(account.lockAmount).dividedBy(1e8).toFixed(0);
        this.isLocked = account.isLocked === '0' ? false : true;
        this.lockHeight = account.lockHeight;

      } catch (error) {
        console.log(error.message);
        console.log(`error(delegate-detail): ${JSON.stringify(error && error.response && error.response.data, null, 2)}`);
        error({ statusCode: 404, message: 'Oops...' })
      }
    },



    handleCurrentChange: async function (currentPage) {
      this.loading = true;

      const from = (currentPage - 1) * this.pageSize;
      const query = {
        limit: this.pageSize,
        offset: from,
        publicKey: this.publicKey,
      };
      console.log(JSON.stringify(query));
      const downloadedBlocks = (await connection.api.Delegate.ownProducedBlocks(query)).blocks;
      console.log(`length: ${downloadedBlocks.length}`);
      this.currentBlocks = [];
      this.currentBlocks = downloadedBlocks;

      this.loading = false;
    },
  },

  computed: {
    ...mapGetters(['width']),
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
.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

/* changed from 300px to 650 */
@media screen and (min-width: 650px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

/* removed one media query */

@media screen and (min-width: 800px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>