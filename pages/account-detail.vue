<template>
  <el-container direction="vertical">
    <el-card>
      <h2>Account info</h2>
      <el-row>
        <el-col :span="5" >
          Address
          <p >{{address}}</p>
        </el-col>
        <el-col :span="5" >
          GNY Balance
          <p >{{balance}}</p>
        </el-col>
        <el-col :span="5" >
          Username
          <p v-if="account.username">{{account.username}}</p>
          <p v-else>Not set</p>
        </el-col>
        <el-col :span="5" >
          Public Key
          <p v-if="publicKey">{{publicKey}}</p>
          <p v-else>Not set</p>
        </el-col> 
        <el-col :span="4" >
          Delegate
          <p v-if="account.isDelegate"><router-link :to="{name: 'delegate-detail', query: { username: account.username }}">Details</router-link></p>
          <p v-else>False</p>
        </el-col> 
      </el-row>
    </el-card>

    <el-card>
      <h2>Transactions</h2>
      
      <el-table class="clickable-rows" @row-click="rowClick" :data="transactions" stripe style="width: 95%; margin: auto;" height="300">
        <el-table-column prop="height" align="center" label="Height" width="150"></el-table-column>
        <el-table-column prop="id" align="center" label="Transaction ID" width="200">
          <template v-slot:default="table">
            <el-tooltip content="Bottom center" placement="bottom" effect="light">
              <div slot="content">{{table.row.id}}</div>
              <router-link :to="{name: 'transaction', query: { id: table.row.id }}" tag="span">
                {{table.row.id.slice(0,8)}}
              </router-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
          <template v-slot:default="table">
            <el-tooltip content="Bottom center" placement="bottom" effect="light">
              <div slot="content">{{table.row.senderId}}</div>
              <div>{{table.row.senderId.slice(0,8)}}</div>
            </el-tooltip>
          </template>
        </el-table-column>

        <infinite-loading
          slot="append"
          @infinite="infiniteHandler"
          force-use-infinite-wrapper=".el-table__body-wrapper">
        </infinite-loading>
      </el-table>
    </el-card>

  </el-container>
</template>

<script>
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gny/utils';
import * as gnyClient from '@gny/client';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);

export default {
    data() {
      return {
        account: {},
        transactions: [],
        address: '',
        publicKey: '',
        balance: '',
        loaded: 0,
      }
    },

    methods: {
    rowClick: function(row) {
        console.log(row.id);
        this.$router.push({name: 'transaction', query: { id: row.id }});
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    infiniteHandler: function ($state) {
      setTimeout(async () => {
        console.log('Loading more transactions...');
        const limit = 5;
        const offset = this.loaded;
        const senderId = this.account.address;
        const query = {
          limit,
          offset,
          senderId
        }

        const transactions = (await connection.api.Transaction.getTransactions(query)).transactions;

        await this.$store.dispatch('appendTransactions', transactions);
        this.transactions = this.$store.state.transactions;

        console.log(`transaction[0]: ${JSON.stringify(this.transactions[0], null, 2)}`);

        this.loaded += limit;
        $state.loaded();
      }, 1000)
    },
  },

    async mounted() {
      const address = this.$route.query.address;
      const username = this.$route.query.username;

      try {
        const account = (await connection.api.Account.getAccountByUsername(username));
  
        console.log(`account: ${JSON.stringify(account, null, 2)}`);
        this.account = account;
        this.address = account.address.slice(0, 8);
        this.balance = new BigNumber(account.gny).dividedBy(1e8).toFixed();

        console.log('balance: ', account.gny);
        console.log('balance: ', this.balance);

        if (account.publicKey) {
          this.publicKey = account.publicKey.slice(0, 8);
        }

        const limit = 5;
        const offset = 0;
        const senderId = account.address;

        const query = {
          limit,
          offset,
          senderId,
        }

        this.transactions = (await connection.api.Transaction.getTransactions(query)).transactions;
        this.loaded = 5;
        await this.$store.dispatch('setTransactions', this.transactions);

        console.log(this.transactions[0]);
      } catch (error) {
        debugger;
        error({ statusCode: 404, message: 'Oops...' })
      }
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

.el-card {
  margin-top: 20px;
}

.el-col {
  font-weight: 500;
}


p {
  color: #acacac;
}

/* row clickable */
.clickable-rows tbody tr td {
  cursor: pointer;
}

.clickable-rows .el-table__expanded-cell {
  cursor: default;
}
</style>