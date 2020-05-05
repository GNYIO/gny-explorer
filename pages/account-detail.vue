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

    <el-card v-if="balances.length > 0">
      <h2>Assets</h2>

      <el-table class="clickable-rows" :data="balances" stripe style="width: 95%;">
        <el-table-column prop="currency" align="center" label="Currency" ></el-table-column>
        <el-table-column prop="balance" align="center" label="Balance" width="300"></el-table-column>
        <el-table-column prop="flag" align="center" label="Flag" width="300"></el-table-column>
      </el-table>
    </el-card>

    <el-card>
      <h2>Transactions</h2>
      
      <el-table class="clickable-rows" @row-click="rowClick" :data="transactions" stripe style="width: 95%;" height="300">
        <el-table-column prop="height" align="center" label="Height" width="150"></el-table-column>
        <el-table-column prop="id" align="center" label="Transaction ID">
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

        <!-- <infinite-loading
          slot="append"
          @infinite="infiniteHandler"
          force-use-infinite-wrapper=".el-table__body-wrapper">
        </infinite-loading> -->

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
  process.env['GNY_HTTPS'],
);

export default {
    data() {
      return {
        account: {},
        transactions: [],
        balances: [],
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

    subSenderId: function (row, column) {0
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    infiniteHandler: async function ($state) {
      console.log(`infiniteHandler`);
      
      var ctx = this;

        // try {
        //     console.log('Loading more transactions...');
        //     const limit = 5;
        //     const offset = ctx.loaded;
        //     const senderId = ctx.account.address;
        //     const query = {
        //       limit,
        //       offset,
        //       senderId
        //     }

        //     const transactions = (await connection.api.Transaction.getTransactions(query)).transactions;
        //     this.transactions = transactions;

        //     // await ctx.$store.dispatch('appendTransactions', transactions);
        //     // ctx.transactions = this.$store.state.transactions;

        //     ctx.loaded += limit;

        //     console.log(transactions.length);
        //     $state.loaded();

        //     if (transactions.length === 0) {
        //       $state.complete();
        //     }
        // } catch (err) {
        //   console.log(err);
        // }


    },
  },

    async mounted() {
      const address = this.$route.query.address;
      const username = this.$route.query.username;

      try {
        let account = null;
        if (address) {
            const result = await connection.api.Account.getAccountByAddress(address);
            if (result.success === true) {
                account = result.account;
            }
        }

        if (username) {
            const result = await connection.api.Account.getAccountByUsername(username);
            if (result.success === true) {
                account = result;
            }
        }

        this.account = account;
        this.address = account.address.slice(0, 8);
        this.balance = new BigNumber(account.balance).dividedBy(1e8).toFixed();

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

        this.balances = (await connection.api.Uia.getBalances(senderId)).balances;

        await this.$store.dispatch('setTransactions', this.transactions);
      } catch (error) {
        console.log(error && error.response && error.response.data);
        // error({ statusCode: 404, message: 'Oops...' })
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