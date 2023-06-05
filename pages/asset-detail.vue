<template>
  <div>
    <b-card title="Asset Info" class="shadow">
      <div class="wrapper">
        <div>
          Name
          <p>{{asset.name}}</p>
        </div>
        <div>
          Description
          <p>{{asset.desc}}</p>
        </div>
        <div>
          Issuer Name
          <p>{{issuer.name}}</p>
        </div>
        <div>
          Issuer Account
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: asset.issuerId }}">
             {{assetIssuerId}}
            </nuxt-link>
          </p>
        </div>
        <div>
          Precision
          <p>{{asset.precision}}</p>
        </div> 
        <div>
          Maximum
          <p>{{asset.maximumPretty}}</p>
        </div>
        <div>
          Left to Issue
          <p>{{asset.leftToIssuePretty}}</p>
        </div>
        <div>
          Asset Registration
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: asset.tid }}">
              {{assetTid}}
            </nuxt-link>
          </p>
        </div>
      </div>
    </b-card>

    <b-card title="Issuer Transaction" class="shadow mt-4">

      <el-table :data="issuerTransactions" stripe style="width: 100%; margin: auto;"  v-loading="issuerLoading">
        <el-table-column prop="id" align="center" label="TX ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto" :formatter="timestamp2date"></el-table-column>
        <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="fee" label="Fee" :formatter="formatFee" width="auto"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Asset Transaction" class="shadow mt-4">

      <el-table :data="assetTransactions" stripe style="width: 100%; margin: auto;"  v-loading="assetLoading">
        <el-table-column prop="id" align="center" label="TX ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto" :formatter="timestamp2date"></el-table-column>
        <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="fee" label="Fee" :formatter="formatFee" width="auto"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Issue Transactions" class="shadow mt-4">

      <el-table :data="issueTransactions" stripe style="width: 100%; margin: auto;"  v-loading="issueLoading">
        <el-table-column prop="id" align="center" label="TX ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto" :formatter="timestamp2date"></el-table-column>
        <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="fee" label="Fee" :formatter="formatFee" width="auto"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Transfers" class="shadow mt-4">

      <el-table :data="currentTransfers" stripe style="width: 100%; margin: auto;"  v-loading="transferLoading">
        <el-table-column prop="id" align="center" width="auto" label="TX ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="timestamp" align="center" label="Forged Time" width="auto" :formatter="timestamp2date"></el-table-column>
        <el-table-column v-if="width >= 500" prop="senderId" align="center" label="Sender" width="auto" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 400" prop="fee" label="Fee" :formatter="formatFee" width="auto"></el-table-column>
        <el-table-column v-if="width >= 400" prop="type" label="Type" :formatter="formatType" width="auto"></el-table-column>
      </el-table>

      <el-pagination
        @current-change="handleCurrentTransfersChange"
        :current-page="currentTransfersPage"
        :page-size="10"
        layout="prev, pager, next"
        :total="transfersCount"
        align="center"
     ></el-pagination>

    </b-card>

    <b-card title="Holders" class="shadow mt-4">

      <el-table :data="currentHolders" stripe v-loading="holdersLoading">
        <el-table-column prop="address" align="center" label="Address" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.address }}">
              {{table.row.address.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="currency" align="center" label="Currency" width="auto"></el-table-column>
        <el-table-column v-if="width >= 500" prop="balance" label="Balance" :formatter="formatBalance" width="auto"></el-table-column>
      </el-table>

      <el-pagination
        @current-change="handleCurrentHoldersChange"
        :current-page="currentHoldersPage"
        :page-size="10"
        layout="prev, pager, next"
        :total="holdersCount"
        align="center"
     ></el-pagination>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { slots } from '@gny/utils';
import * as gnyClient from '@gny/client';
import { contractMappingFilter } from '../helpers/getTransactionType';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    ...mapGetters(['width']),
  },
  watch: { 
    '$route.query.assetName': async function(assetName) {
      console.log(assetName);
      await this.updatePage(assetName);
    }
  },
  data() {
    return {
      asset: {},
      assetIssuerId: '',
      assetTid: '',
      issuer: {},
      precision: '',
      issuerTransactions: [],
      assetTransactions: [],
      issueTransactions: [],
      transfers: [],
      holders: [],
      transfersCount: 0,
      currentTransfers: [],
      currentTransfersPage: 1,
      holdersCount: 0,
      currentHolders: [],
      currentHoldersPage: 1,
      pageSize: 10,
      issuerLoading: true,
      assetLoading: true,
      issueLoading: true,
      transferLoading: true,
      holdersLoading: true,
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
      return moment.utc(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');
    },

    formatFee: function (row, column) {
      return new BigNumber(row.fee).dividedBy(this.precision).toFixed();
    },

    formatBalance: function (row, column) {
      return new BigNumber(row.balance).dividedBy(this.precision).toFixed();
    },

    formatType: function (row, column) {
      return contractMappingFilter(row.type);
    },

    makeAssetPretty: function(asset) {
      const prec = Math.pow(10, asset.precision);
      const difference = new BigNumber(asset.maximum)
        .minus(asset.quantity)
        .toFixed();

      console.log(`asset-raw: ${JSON.stringify(asset, null, 2)}`);
      const one = {
        tid: asset.tid,
        name: asset.name,
        precision: asset.precision,
        maximum: asset.maximum,
        maximumPretty: new BigNumber(asset.maximum).dividedBy(prec).toFixed(),
        quantity: asset.quantity,
        quantityPretty: new BigNumber(asset.quantity).dividedBy(prec).toFixed(),
        leftToIssue: difference,
        leftToIssuePretty: new BigNumber(difference).dividedBy(prec).toFixed(),
        desc: asset.desc,
        issuerId: asset.issuerId,
      };
      return one;
    },

    updatePage: async function (assetName) {
      try {
        const result = this.makeAssetPretty(
          (await connection.api.Uia.getAsset(assetName)).asset
        );
        console.log(`result: ${JSON.stringify(result, null, 2)}`)
        this.asset = result;
        this.assetIssuerId = result.issuerId.slice(0, 12);
        this.assetTid = result.tid.slice(0, 12);
        this.precision = Math.pow(10, result.precision);

        const issuerName = result.name.split('.')[0];
        const issuer = (await connection.api.Uia.getIssuer(issuerName)).issuer;
        this.issuer = issuer;

        this.issuerTransactions = (await connection.api.Transaction.getTransactions({senderId: result.issuerId, type: 100})).transactions;
        
        if (this.issuerTransactions.length>= 0) {
          this.issuerLoading = false;
        }

        this.assetTransactions = (await connection.api.Transaction.getTransactions({senderId: result.issuerId, type: 101})).transactions;
        
        if (this.assetTransactions.length>= 0) {
          this.assetLoading = false;
        }

        this.issueTransactions = (await connection.api.Transaction.getTransactions({senderId: result.issuerId, type: 102})).transactions;
        
        if (this.issueTransactions.length>= 0) {
          this.issueLoading = false;
        }

        const allTransfers = (await connection.api.Transaction.getTransactions({type: 103})).transactions.reverse();

        this.transfers = allTransfers.filter(function(transfer) {
          return JSON.parse(transfer.args)[0] === result.name;
        })

        this.transfersCount = this.transfers.length;
        
        if (this.transfersCount>= 0) {
          this.transferLoading = false;
        }

        this.holders = (await connection.api.Uia.getHolders(assetName)).holders;

        this.holdersCount = this.holders.length;

        if (this.holdersCount>= 0) {
          this.holdersLoading = false;
        }

      } catch (error) {
        console.log(error.message);
        error({ statusCode: 404, message: 'Oops...' })
      }
    },

    handleCurrentTransfersChange(currentPage) {
      this.currentTransfersPage = currentPage;
      this.changeTransfersPage(this.transfers, currentPage);
    },

    changeTransfersPage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize;
      let to = currentPage * this.pageSize;
      this.currentTransfers = [];
      for (; from < to; from++) { 
        if (list[from]) {
          this.currentTransfers.push(list[from]);
        }
      }
    },

    handleCurrentHoldersChange(currentPage) {
      this.currentHoldersPage = currentPage;
      this.changeHoldersPage(this.holders, currentPage);
    },

    changeHoldersPage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize;
      let to = currentPage * this.pageSize;
      this.currentHolders = [];
      for (; from < to; from++) { 
        if (list[from]) {
          this.currentHolders.push(list[from]);
        }
      }
    },

  },

  async mounted() {
    const assetName = this.$route.query.assetName;
    await this.updatePage(assetName);

    this.handleCurrentTransfersChange(1);
    this.handleCurrentHoldersChange(1);
  }
};

</script>

<style scoped>
.card {
  margin-bottom: 2rem;
}

.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

@media screen and (min-width: 300px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 500px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media screen and (min-width: 800px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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