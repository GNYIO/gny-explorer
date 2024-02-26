<template>
  <div>
    <b-card title="Block" class="shadow">
      <div class="wrapper">
        <div>
          Block ID
          <p>
            {{id}}...  <i class="el-icon-copy-document" @click="copyId"></i>
          </p>
        </div>
        <div :span="8" >
          Height
          <p>{{block.height}}</p>
        </div>
        <div :span="8" v-if="prevId">
          Previous block
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'block-detail', query: { height: block.height - 1 }}">
              {{prevId}}...
            </nuxt-link>
          </p>
        </div>
        <div :span="8" v-if="!prevId">
          Previous block
          <p>-</p>
        </div>
        <div :span="8" >
          Date
          <p>{{date}}</p>
        </div>
        <div :span="8" >
          Transaction count
          <p >{{block.count}}</p>
        </div>
        <div :span="8" >
          Reward
          <p >{{reward}} GNY</p>
        </div>
        <div :span="8" >
          Delegate
          <p v-if="block.height !== '0'">
            <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { publicKey: block.delegate }}">
              {{delegateOrUsername}}
            </nuxt-link>
          </p>
          <!-- delegate for block height 0 doesn't exist -->
          <p v-if="block.height === '0'">-</p>
        </div>
      </div>
    </b-card>

    <b-card title="Transactions included in this Block" class="shadow mt-4">
      <el-table :data="transactions" stripe style="width: 95%; margin: auto;">
        <el-table-column prop="id" align="center" label="Transaction ID" width="150">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="280" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="fee" align="center" label="Fee" width="120"></el-table-column>
      </el-table>
    </b-card>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';
import moment from 'moment';
import * as gnyClient from '@gnyio/client';
import { slots } from '@gnyio/utils';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);



export default {
  watch: { 
    '$route.query.height': async function(height) {
      console.log(height);
      await this.updatePage(height);
    }
  },

  data() {
    return {
      block: {},
      id: '',
      reward: '',
      prevId: '',
      date: '',
      delegateOrUsername: '',
      transactions: [],
    }
  },

  methods: {
    copyId: async function() {
      try {
        await this.$copyText(this.block.id);
      } catch (e) {
        console.error(e);
      }
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
    },

    updatePage: async function (height) {
      try {
      const block = (await connection.api.Block.getBlockByHeight(height)).block;
      const transactions = (await connection.api.Transaction.getTransactions({
          height: height,
      })).transactions;

      this.block = block

      if (new BigNumber(this.block.height).isGreaterThan(0)) {
        this.prevId = this.block.prevBlockId.slice(0, 24);
      } else {
        this.prevId = null;
      }
      
      this.date = moment.utc(slots.getRealTime(this.block.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
      this.transactions = transactions;

      this.id = this.block.id.slice(0, 24);

      this.reward = new BigNumber(this.block.reward).dividedBy(1e8).toFixed();

      // delegate should always have an username
      const rawDelegate = await connection.api.Delegate.getDelegateByPubKey(this.block.delegate);
      this.delegateOrUsername = rawDelegate.delegate.username;
    } catch (error) {
      console.log(error.message);
      error({ statusCode: 404, message: 'Oops...' })
    }

    }
  },

  async mounted() {
    const height = this.$route.query.height;
    await this.updatePage(height);
  }
}
</script>

<style scoped>
i {
    cursor: pointer;
}

.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

/* changed */
@media screen and (min-width: 700px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

/* changed */
@media screen and (min-width: 1000px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

p {
  color: #acacac;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

.el-icon-copy-document {
  transition: 0.1s;
  transition-property: color;
}

.el-icon-copy-document:hover {
  color: #565656;
}

.el-icon-copy-document:active {
  color: black;
}

</style>
