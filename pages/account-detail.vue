<template>
  <el-container direction="vertical">
    <b-card title="Account info" class="shadow">
      <el-row>
        <el-col :span="10">
          Address
          <p >{{account.address}}</p>
        </el-col>
        <el-col :span="7">
          GNY Balance
          <br v-if="balance === ''">
          <i v-if="balance === ''"  class="el-icon-loading"></i>
          <p >{{balance}}</p>
        </el-col>
        <el-col :span="7">
          Username
          <p v-if="account.username">{{account.username}}</p>
          <p v-else>Not set</p>
        </el-col>
      </el-row>
      <el-row v-if="account.isLocked"> 
        <el-col :span="10">
          Locked
          <p>True</p>
        </el-col> 
        <el-col :span="7">
          Lock Height
          <p>{{account.lockHeight}}</p>
        </el-col>
        <el-col :span="7">
          Lock Amount
          <p>{{lockAmount}}</p>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          Public Key
          <p v-if="publicKey">{{publicKey}}</p>
          <p v-else>Not set</p>
        </el-col> 
        <el-col :span="7">
          Delegate
          <p v-if="account.isDelegate"><nuxt-link :to="{name: 'delegate-detail', query: { username: account.username }}">Details</nuxt-link></p>
          <p v-else>False</p>
        </el-col>
      </el-row>
    </b-card>

    <!-- v-if="balances.length > 0" -->
    <b-card title="Assets" class="shadow mt-4">
      <el-table class="clickable-rows" :data="assets" stripe style="width: 95%;">
        <el-table-column prop="currency" align="center" label="Currency" >
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'asset-detail', query: { assetName: table.row.currency }}" tag="span">
              {{table.row.currency}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="balance" align="center" label="Balance" width="300" :formatter="prettyPrintAssetAmount"></el-table-column>
        <el-table-column prop="flag" align="center" label="Flag" width="300"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Transactions" class="shadow mt-4">
      <el-table @row-click="rowClick" :data="transactions" stripe style="width: 95%;">
        <el-table-column prop="height" align="center" label="Height" width="150">
          <template v-slot:default="table">
             <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}" tag="span">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="id" align="center" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}" tag="span">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId"></el-table-column>
      </el-table>
    </b-card>

     <b-card title="Past Transfers" class="shadow mt-4">
      <el-table @row-click="rowClick" :data="currentTransfers" style="width: 100%">
        <el-table-column prop="senderId" label="Sender" align="center" width="200" :formatter="prettyPrintSenderAddress"></el-table-column>
        <el-table-column prop="recipientId" label="Recipient" align="center" width="200" :formatter="prettyPrintRecipientAddress"></el-table-column>
        <el-table-column prop="currency" align="center" label="Currency"></el-table-column>
        <el-table-column prop="amount" align="center" label="Amount" :formatter="prettyPrintAmount"></el-table-column>
        <el-table-column prop="height" align="center" label="Height"></el-table-column>
      </el-table>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="10"
        layout="prev, pager, next"
        :total="transfersCount"
        align="center"
      ></el-pagination>

    </b-card>

  </el-container>
</template>

<script>
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gny/utils';
import * as gnyClient from '@gny/client';

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

    '$route.query.address': async function(address) {
      console.log(address);
      await this.updatePage(null, address);
    }
  },

  data() {
    return {
      account: {},
      transactions: [],
      balances: [],
      assets: [],
      address: '',
      publicKey: '',
      balance: '',
      lockAmount: '',
      loaded: 0,
      transfers: [],
      transfersCount: 0,
      currentTransfers: [],
      currentPage: 1,
      pageSize: 10,
    }
  },

  methods: {
    rowClick: function(row) {
        console.log(row.id);
        this.$router.push({name: 'transaction-detail', query: { id: row.id }});
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    prettyPrintSenderAddress: function(row, column) {
      if (row.senderId === this.address) {
        return 'Me';
      }

      return row.senderId.slice(0,8);
    },

    prettyPrintRecipientAddress: function(row, column) {
      if (row.recipientId === this.address) {
        return 'Me';
      }

      return row.recipientId.slice(0,8);
    },

    prettyPrintAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      BigNumber.set({ DECIMAL_PLACES: 2 });
      return new BigNumber(row.amount).dividedBy(prec).toFixed();
    },

    prettyPrintAssetAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      BigNumber.set({ DECIMAL_PLACES: 2 });
      return new BigNumber(row.balance).dividedBy(prec).toFixed();
    },

    updatePage: async function (username, address) {
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

        BigNumber.set({ DECIMAL_PLACES: 4 });
        this.balance = new BigNumber(this.account.gny || this.account.balance).dividedBy(1e8).toFixed();

        if (account.isLocked) {
          this.lockAmount = new BigNumber(account.lockAmount).dividedBy(1e8).toFixed();
        }

        if (account.publicKey) {
          this.publicKey = account.publicKey.slice(0, 8);
        }

        const senderId = account.address;

        const query = {
          senderId,
        }

        this.transactions = (await connection.api.Transaction.getTransactions(query)).transactions.reverse();

        this.balances = (await connection.api.Uia.getBalances(senderId)).balances;

        for (let i = 0; i < this.balances.length; i++) {
          const currency = this.balances[i].currency;
          const asset = (await connection.api.Uia.getAsset(currency)).asset;
          const precision = asset.precision;

          this.assets.push({...this.balances[i], ...{precision}});
        }

        console.log(this.assets);

        this.transfersResult = await connection.api.Transfer.getRoot({
          ownerId: senderId
        });

        this.transfers = this.transfersResult.transfers;
        console.log(this.transfers.length);

        for (let i = 0; i < this.transfers.length; i++) {
          const currency = this.transfers[i].currency;
          if (currency === 'GNY') {
            this.transfers[i]['precision'] = 8;
          } else {
            const precision = this.assets.filter(asset => {
              return asset.currency === currency;
            })[0].precision;
            this.transfers[i]['precision'] = precision;
          }
        }

        this.transfersCount = this.transfersResult.count;

        
      } catch (error) {
        console.log(error && error.response && error.response.data);
        // error({ statusCode: 404, message: 'Oops...' })
      }
    },

    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.changePage(this.transfers, currentPage);
    },

    changePage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize;
      let to = currentPage * this.pageSize;
      this.currentTransfers = [];
      for (; from < to; from++) {
        if (list[from]) {
          this.currentTransfers.push(list[from]);
        }
      }
    },
  },

  async mounted() {
    this.address = this.$route.query.address;
    const username = this.$route.query.username;

    await this.updatePage(username, this.address);
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

.el-card {
  margin-top: 20px;
}

.el-col {
  font-weight: 500;
}


p {
  color: #acacac;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>
