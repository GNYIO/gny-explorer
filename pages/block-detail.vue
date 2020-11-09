<template>
  <el-container direction="vertical">
    <b-card title="Block" class="shadow">
      <el-row>
        <el-col :span="8" >
          Height
          <p >{{block.height}}</p>
        </el-col>
        <el-col :span="8" >
          ID
          <p >{{id}}</p>
        </el-col>
        <el-col :span="8" >
          Date
          <p >{{date}}</p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8" >
          Transaction count
          <p >{{block.count}}</p>
        </el-col>
        <el-col :span="8" >
          Reward
          <p >{{block.reward}}</p>
        </el-col>
        <el-col :span="8" >
          Delegate
          <p v-if="block.height !== '0'">
            <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { publicKey: block.delegate }}">
              {{delegateID}}
            </nuxt-link>
          </p>
          <!-- delegate for block height 0 doesn't exist -->
          <p v-if="block.height === '0'">{{delegateID}}</p>
        </el-col>
      </el-row>
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
  </el-container>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
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
      date: '',
      delegateID: '',
      transactions: [],
    }
  },

  methods: {
    rowClick: function(row) {
        console.log(row.id);
        this.$router.push({name: 'transaction-detail', query: { id: row.id }});
    },

    subID: function (row, column) {
      return row.id.slice(0,8);
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    updatePage: async function (height) {
      try {
      const block = (await connection.api.Block.getBlockByHeight(height)).block;
      const transactions = (await connection.api.Transaction.getTransactions({
          height: height,
      })).transactions;

      console.log(`block-detail: ${JSON.stringify(block, null, 2)}`);
      this.block = block
      this.id = this.block.id.slice(0, 8);
      this.date = moment(slots.getRealTime(this.block.timestamp)).format('YYYY-MM-DD hh:mm:ss');
      this.transactions = transactions;
      this.delegateID = this.block.delegate.slice(0, 8);
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
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}

.el-card {
  margin-top: 20px;
}

.el-col {
  font-weight: 500;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

</style>
