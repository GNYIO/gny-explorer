<template>
  <el-container direction="vertical">
    <b-card title="Asset Info" class="shadow">
      <el-row>
        <el-col :span="6" >
          Name
          <p>{{asset.name}}</p>
        </el-col>
        <el-col :span="6" >
          Description
          <p>{{asset.desc}}</p>
        </el-col>
        <el-col :span="6">
          Issuer Name
          <p>{{issuer.name}}</p>
        </el-col>
        <el-col :span="6">
          Issuer Account
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: asset.issuerId }}">
             {{assetIssuerId}}
            </nuxt-link>
          </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          Precision
          <p>{{asset.precision}}</p>
        </el-col> 
        <el-col :span="6">
          Maximum
          <p>{{asset.maximumPretty}}</p>
        </el-col>
        <el-col :span="6">
          Left to Issue
          <p>{{asset.leftToIssuePretty}}</p>
        </el-col>
        <el-col :span="6">
          TransactionId
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: asset.tid }}">
              {{assetTid}}
            </nuxt-link>
          </p>
        </el-col>
      </el-row>
    </b-card>

    <b-card title="Issuer Transaction" class="shadow mt-4">

      <el-table :data="issuerTransactions" stripe style="width: 100%; margin: auto;"  v-loading="issuerLoading">
        <el-table-column prop="id" align="center" width="200" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}" tag="span">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="120">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}" tag="span">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="Fee" :formatter="formatFee"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Asset Transaction" class="shadow mt-4">

      <el-table :data="assetTransactions" stripe style="width: 100%; margin: auto;"  v-loading="assetLoading">
        <el-table-column prop="id" align="center" width="200" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}" tag="span">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="120">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}" tag="span">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="Fee" :formatter="formatFee"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Issue Transactions" class="shadow mt-4">

      <el-table :data="issueTransactions" stripe style="width: 100%; margin: auto;"  v-loading="issueLoading">
        <el-table-column prop="id" align="center" width="200" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}" tag="span">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="120">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}" tag="span">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="Fee" :formatter="formatFee"></el-table-column>
      </el-table>
    </b-card>

    <b-card title="Transfers" class="shadow mt-4">

      <el-table :data="currentTransfers" stripe style="width: 100%; margin: auto;"  v-loading="transferLoading">
        <el-table-column prop="id" align="center" width="200" label="Transaction ID">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'transaction-detail', query: { id: table.row.id }}" tag="span">
              {{table.row.id.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="height" align="center" label="Block Height" width="120">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: table.row.height }}">
              {{table.row.height}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <el-table-column prop="senderId" align="center" label="Sender" width="200" :formatter="subSenderId">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.senderId }}" tag="span">
              {{table.row.senderId.slice(0,8)}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="Fee" :formatter="formatFee"></el-table-column>
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

      <el-table :data="currentHolders" stripe style="width: 100%; margin: auto;"  v-loading="holdersLoading">
        <el-table-column prop="address" align="center" label="Address">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: table.row.address }}" tag="span">
              {{table.row.address}}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="currency" align="center" label="Currency"></el-table-column>
        <el-table-column prop="balance" label="Balance" :formatter="formatBalance"></el-table-column>
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
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },

    formatFee: function (row, column) {
      return new BigNumber(row.fee).dividedBy(this.precision).toFixed();
    },

    formatBalance: function (row, column) {
      return new BigNumber(row.balance).dividedBy(this.precision).toFixed();
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
        
        if (this.issuerTransactions.length >= 0) {
          this.issuerLoading = false;
        }

        this.assetTransactions = (await connection.api.Transaction.getTransactions({senderId: result.issuerId, type: 101})).transactions;
        
        if (this.assetTransactions.length >= 0) {
          this.assetLoading = false;
        }

        this.issueTransactions = (await connection.api.Transaction.getTransactions({senderId: result.issuerId, type: 102})).transactions;
        
        if (this.issueTransactions.length >= 0) {
          this.issueLoading = false;
        }

        const allTransfers = (await connection.api.Transaction.getTransactions({type: 103})).transactions;

        this.transfers = allTransfers.filter(function(transfer) {
          return JSON.parse(transfer.args)[0] === result.name;
        })
        this.transfersCount = this.transfers.length;
        
        if (this.transfersCount >= 0) {
          this.transferLoading = false;
        }

        this.holders = (await connection.api.Uia.getHolders(assetName)).holders;

        this.holdersCount = this.holders.length;

        if (this.holdersCount >= 0) {
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