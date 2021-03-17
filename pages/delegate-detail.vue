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
              <p>{{delegate.approval}}</p>
          </el-col>
          <el-col :span="8">
              Productivity
              <p>{{delegate.productivity}} / 1</p>
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

    <b-card title="Produced Blocks" class="shadow">
      <el-table :data="blocks" stripe style="width: 100%; margin: auto;" v-loading="loading">
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

  </el-container>
</template>

<script>
import * as gnyClient from '@gny/client';
import BigNumber from 'bignumber.js';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  watch: { 
    '$route.query.username': async function(username) {
      console.log(username);
      await this.updatePage(username, null);
    },

    '$route.query.publicKey': async function(publicKey) {
      console.log(publicKey);
      await this.updatePage(null, publicKey);
    }
  },

  data() {
    return {
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

        console.log(`delegate: ${JSON.stringify(delegate, null, 2)}`);
        this.delegate = delegate;
        this.publicKey = delegate.publicKey;
        this.trs = delegate.tid.slice(0, 8);
        this.rewards = new BigNumber(delegate.rewards).dividedBy(1e8).toFixed();

        const query = {
          offset: this.offset,
          publicKey: this.publicKey,
        }

        this.blocks = (await connection.api.Delegate.ownProducedBlocks(query)).blocks;
        this.blocksCount = this.blocks.length();

        if (this.blocks.length >= 0) {
            this.loading = false;
        }
      } catch (error) {
        console.log(`error(delegate-detail): ${JSON.stringify(error && error.response && error.response.data, null, 2)}`);
        error({ statusCode: 404, message: 'Oops...' })
      }
    },

    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
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

  async mounted() {
    this.username = this.$route.query.username;
    this.publicKey = this.$route.query.publicKey;
    console.log(`publicKey: ${publicKey}`);
    
    await this.updatePage(username, publicKey);
    this.handleCurrentChange(1);
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