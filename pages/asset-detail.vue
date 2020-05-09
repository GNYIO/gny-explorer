<template>
  <el-container direction="vertical">
    <el-card>
      <h2>Asset Info</h2>
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
          Issuer
          <p>{{issuer.name}}</p>
        </el-col>
        <el-col :span="6">
          Account
          <router-link :to="{name: 'account-detail', query: { address: asset.issuerId }}">
            <p>{{assetIssuerId}}</p>
          </router-link>

        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6" >
          TransactionId
          <router-link :to="{name: 'transaction', query: { id: asset.tid }}">
            <p>{{assetTid}}</p>
          </router-link>
        </el-col> 
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
      </el-row>
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
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS'] || false,
);

export default {
    data() {
      return {
        asset: {},
        assetIssuerId: '',
        assetTid: '',
        issuer: {},
      }
    },

    methods: {
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
    },

    async mounted() {
      const assetName = this.$route.query.assetName;

      try {
        const result = this.makeAssetPretty(
          (await connection.api.Uia.getAsset(assetName)).asset
        );
        console.log(`result: ${JSON.stringify(result, null, 2)}`)
        this.asset = result;
        this.assetIssuerId = result.issuerId.slice(0, 12);
        this.assetTid = result.tid.slice(0, 12);

        const issuerName = result.name.split('.')[0];
        const issuer = (await connection.api.Uia.getIssuer(issuerName)).issuer;
        this.issuer = issuer;
      } catch (err) {
        console.log(err);
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