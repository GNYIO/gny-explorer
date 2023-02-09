<template>
  <div>
    <b-card title="Account info" class="shadow">
      <div class="wrapper">
        <div>
          Address
          <p>{{account.address}}</p>
        </div>
        <div>
          Unlocked Balance
          <br v-if="balance === ''">
          <i v-if="balance === ''"  class="el-icon-loading"></i>
          <p >{{balance}}</p>
        </div>
        <div>
          Locked Balance
          <p>{{lockAmount}}</p>
        </div>
        <div>
          Is Locked
          <p>{{isLocked}}</p>
        </div> 
        <div >
          Lock Height
          <p>{{lockHeight}}</p>
        </div>
        <div>
          Username
          <p v-if="account.username">{{account.username}}</p>
          <p v-else>Not set</p>
        </div>
        <div>
          Public Key
          <p v-if="publicKey">{{publicKey}}</p>
          <p v-else>Not set</p>
        </div> 
        <div>
          Delegate
          <p v-if="account.isDelegate"><nuxt-link :to="{name: 'delegate-detail', query: { username: account.username }}">Details</nuxt-link></p>
          <p v-else>False</p>
        </div>
      </div>
    </b-card>

    <!-- v-if="balances.length > 0" -->
    <b-card title="Custom Assets" class="shadow mt-4">
      <el-table class="clickable-rows" :data="assets" stripe>
        <el-table-column prop="currency" align="center" label="Currency" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'asset-detail', query: { assetName: table.row.currency }}" tag="span">
              {{table.row.currency}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="balance" align="center" label="Balance" width="auto" :formatter="prettyPrintAssetAmount"></el-table-column>
        <el-table-column v-if="width > 600" prop="flag" align="center" label="Flag" width="auto"></el-table-column>
      </el-table>
    </b-card>

    <transactions-i-sent :senderAddress="address"></transactions-i-sent>

    <b-card title="Asset Transfers" class="shadow mt-4">
      <el-table @row-click="rowClick" :data="currentTransfers" style="width: 100%">

        <el-table-column prop="amount" align="center" label="Amount" :formatter="prettyPrintAmount" width="auto"></el-table-column>

        <el-table-column v-if="width >= 500" prop="currency" align="center" label="Currency" width="auto">
          <template v-slot:default="table">
            <span v-if="table.row.currency === 'GNY'">GNY</span>
            <nuxt-link v-else class="nuxt-link" :to="{ name: 'asset-detail', query: { assetName: table.row.currency }}" tag="span">{{ table.row.currency }}</nuxt-link>
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 500" prop="senderId" label="Sender" align="center" width="auto">
          <template v-slot:default="table">
             <span v-if="account.address === table.row.senderId">ME</span>
             <nuxt-link v-else class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}" tag="span">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 500" prop="recipientId" label="Recipient" align="center" width="auto">
          <template v-slot:default="table">
             <span v-if="account.address === table.row.recipientId">ME</span>
             <nuxt-link v-else class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.recipientId }}" tag="span">
              {{table.row.recipientId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>

        <el-table-column prop="tid" align="center" label="TX ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: {id: table.row.tid }}" tag="span">
             {{ table.row.tid.slice(0,8) }}
            </nuxt-link>
         </template>
        </el-table-column>
     
        <el-table-column v-if="width >= 800" prop="height" align="center" label="Height" width="auto">
          <template v-slot:default="table">
             <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}" tag="span">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>

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

    <who-i-voted-for-component :addressOfVoter="address"></who-i-voted-for-component>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gny/utils';
import * as gnyClient from '@gny/client';

import TransactionsISent from '../components/TransactionsISent.vue';
import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';

import { contractMappingFilter } from '../helpers/getTransactionType';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  components: {
    'transactions-i-sent': TransactionsISent,
    'who-i-voted-for-component': WhoIVotedForComponent,
  },
  computed: {
    ...mapGetters(['width']),
  },
  watch: { 
    '$route.query.username': async function(username) {
      await this.updatePage(username, null);
    },

    '$route.query.address': async function(address) {
      await this.updatePage(null, address);
    }
  },

  data() {
    return {
      account: {},
      balances: [],
      assets: [],
      address: '',
      publicKey: '',
      balance: '',
      
      isLocked: false,
      lockedAmount: '',
      
      lockHeight: '',
      lockAmount: '',

      loaded: 0,
      transfers: [],
      transfersCount: 0,
      currentTransfers: [],
      currentPage: 1,
      pageSize: 10,
      limit: 100,
      offset: 0,
    }
  },

  methods: {
    rowClick: function(row) {
        console.log(row.id);
        this.$router.push({name: 'transaction-detail', query: { id: row.tid }});
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    prettyPrintAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      return new BigNumber(row.amount).dividedBy(prec).toFixed();
    },

    prettyPrintAssetAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      return new BigNumber(row.balance).dividedBy(prec).toFixed();
    },

    formatFee: function (row, column) {
      return new BigNumber(row.fee).dividedBy(1e8).toFixed();
    },

    formatType: function (row, column) {
      return contractMappingFilter(row.type);
    },

    updatePage: async function (username, address) {
      try {
        let account = null;
        if (address) {
          const result = await connection.api.Account.getAccountByAddress(address);
          if (result.success === true) {
            account = result;
          }
        }

        if (username) {
          const result = await connection.api.Account.getAccountByUsername(username);
          if (result.success === true) {
            account = result;
          }
        }

        this.account = account;
        this.address = account.address;
        this.balance = new BigNumber(this.account.gny).dividedBy(1e8).toFixed(0);

        this.lockAmount = new BigNumber(account.lockAmount).dividedBy(1e8).toFixed(0);
        this.isLocked = account.isLocked === '0' ? false : true;
        this.lockHeight = account.lockHeight;

        if (account.publicKey) {
          this.publicKey = account.publicKey.slice(0, 8);
        }

        const senderId = account.address;

        const query = {
          senderId,
          limit: 5,
        };

        this.balances = (await connection.api.Uia.getBalances(senderId)).balances;

        for (let i = 0; i < this.balances.length; i++) {
          const currency = this.balances[i].currency;
          const asset = (await connection.api.Uia.getAsset(currency)).asset;
          const precision = asset.precision;

          this.assets.push({...this.balances[i], ...{precision}});
        }

        this.transfersResult = await connection.api.Transfer.getRoot({
          ownerId: senderId,
          limit: this.limit,
          offset: this.offset,
        });

        this.transfers = this.transfersResult.transfers;
        this.transfersCount = this.transfersResult.count;
        

        let totalCount = this.transfers.length;
        let newTransfers = [];
 
        while (totalCount < this.transfersCount) {
          this.offset += this.limit;

          newTransfers = (await connection.api.Transfer.getRoot({
            ownerId: senderId,
            limit: this.limit,
            offset: this.offset,
          })).transfers;

          this.transfers.push(...newTransfers);
          totalCount += newTransfers.length;
        }

        this.transfers = this.addPrecision(this.transfers);
        
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

    addPrecision(list) {
      for (let i = 0; i < list.length; i++) {
        const currency = list[i].currency;
        if (currency === 'GNY') {
          list[i]['precision'] = 8;
        } else {
          const precision = this.assets.filter(asset => {
            return asset.currency === currency;
          })[0].precision;
          list[i]['precision'] = precision;
        }
      }

      return list;
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
</style>
