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

    <custom-assets :senderAddress="address"></custom-assets>

    <transactions-i-sent :senderAddress="address"></transactions-i-sent>

    <b-card title="Asset Transfers" class="shadow mt-4">
      <el-table @row-click="rowClick" :data="currentTransfers" style="width: 100%">

        <el-table-column prop="amount" align="center" label="Amount" :formatter="prettyPrintAmount" width="auto"></el-table-column>

        <el-table-column v-if="width >= 500" prop="currency" align="center" label="Currency" width="auto">
          <template v-slot:default="table">
            <span v-if="table.row.currency === 'GNY'">GNY</span>
            <nuxt-link v-else class="nuxt-link" :to="{ name: 'asset-detail', query: { assetName: table.row.currency }}">{{ table.row.currency }}</nuxt-link>
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 500" prop="senderId" label="Sender" align="center" width="auto">
          <template v-slot:default="table">
             <span v-if="account.address === table.row.senderId">ME</span>
             <nuxt-link v-else class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 500" prop="recipientId" label="Recipient" align="center" width="auto">
          <template v-slot:default="table">
             <span v-if="account.address === table.row.recipientId">ME</span>
             <nuxt-link v-else class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.recipientId }}">
              {{table.row.recipientId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>

        <el-table-column prop="tid" align="center" label="TX ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: {id: table.row.tid }}">
             {{ table.row.tid.slice(0,8) }}
            </nuxt-link>
         </template>
        </el-table-column>
     
        <el-table-column v-if="width >= 800" prop="height" align="center" label="Height" width="auto">
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

import TransactionsISentComponent from '../components/TransactionsISent.vue';
import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';
import CustomAssetsComponent from '../components/CustomAssets.vue';

import { contractMappingFilter } from '../helpers/getTransactionType';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  components: {
    'transactions-i-sent': TransactionsISentComponent,
    'who-i-voted-for-component': WhoIVotedForComponent,
    'custom-assets': CustomAssetsComponent,
  },
  computed: {
    ...mapGetters(['width']),
  },
  watch: { 
    '$route.query.username': async function(username) {
      console.log(`(account-detail) username changed`);
      await this.updatePage(username, null);
    },

    '$route.query.address': async function(address) {
      console.log(`(account-detail) address changed`);
      await this.updatePage(null, address);
    }
  },

  data() {
    return {
      account: {},
      address: '',
      publicKey: '',
      balance: '',
      assets: [],

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
      return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
    },

    prettyPrintAmount: function (row, column) {
      const prec = Math.pow(10, row.precision);
      return new BigNumber(row.amount).dividedBy(prec).toFixed();
    },



    formatFee: function (row, column) {
      return new BigNumber(row.fee).dividedBy(1e8).toFixed();
    },

    formatType: function (row, column) {
      return contractMappingFilter(row.type);
    },

    updatePage: async function (username, address) {
      // reset all data properties
        this.account = {}
        this.address = '';
        this.publicKey = '';
        this.balance = '';
        this.assets = [];
        
        this.isLocked = false;
        this.lockedAmount = '';
        
        this.lockHeight = '';
        this.lockAmount = '';

        this.loaded = 0;
        this.transfers = [];
        this.transfersCount = 0;
        this.currentTransfers = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.limit = 100;
        this.offset = 0;

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

        if (account === null) {
          throw new Error('failed to fetch account');
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

        // fetch asset data (for precision data)
        // this is needed asset transfers
        const allAssets = this.transfers.map(x => x.currency);
        const allAssetsNoDuplicates = [...new Set(allAssets)]; // remove duplicates
        for (let i = 0; i < allAssetsNoDuplicates.length; ++i) {
          if (allAssetsNoDuplicates[i] === 'GNY') {
            continue;
          }
          const asset = (await connection.api.Uia.getAsset(allAssetsNoDuplicates[i])).asset;
          this.assets.push(asset);
        }
        console.log(`assets: ${JSON.stringify(this.assets, null, 2)}`);

        this.transfers = this.addPrecision(this.transfers);
        
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
            return asset.name === currency;
          })[0].precision;
          list[i]['precision'] = precision;
        }
      }

      return list;
    },
  },

  async mounted() {
    console.log(`(account-detail) mounted()`);
    const address = this.$route.query.address;
    const username = this.$route.query.username;

    await this.updatePage(username, address);
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
