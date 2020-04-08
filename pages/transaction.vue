<template>
  <el-container direction="vertical">
    <h2>General info</h2>
    <el-card>
      <el-row>
        <el-col :span="24" >
          <span>Transaction ID</span>
          <span v-if="!!transaction">{{transaction.id}}</span>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24" >
          <span>Block height</span>
          <span v-if="!!transaction">{{transaction.height}}</span>
          <span v-if="!!confirmation">{{confirmation}}</span>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24" >
          <span>Forged Time</span>
          <span v-if="!!transaction">{{transaction.timestamp}}</span>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12" >
          <span>Fee</span>
          <span v-if="!!transaction">{{transaction.fee}}</span>
        </el-col>
        <el-col :span="12" >
          <span>Type</span>
          <span v-if="!!transaction">{{transaction.type}}</span>
        </el-col>
      </el-row>
    </el-card>
  </el-container>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
import BigNumber from 'bignumber.js';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);


export default {
  data() {
    return {
      transaction: {
        id: '',
        height: '',
        timestamp: null,
        fee: null,
        type: null,
      },
      confirmation: '',
    }
  },

  methods: {
    // subID: function (row, column) {
    //   return row.id.slice(0,8);
    // },

    // subDelegate: function (row, column) {
    //   return row.delegate.slice(0,8);
    // },

    // timestamp2date: function (row, column) {
    //   return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    // },
  },

  async mounted() {
    const id = this.$route.query.id;
    this.transaction = this.$store.state.transactions.find(transation => transation.id = id);


    if (!this.transaction) {
      try {
        const query = {
          id: id,
        }
        const result = (await connection.api.Transaction.getTransactions(query)).transactions;
        this.transaction = result[0];

      } catch (error) {
        console.log(error.message);
        // error({ statusCode: 404, message: 'Oops...' });
      }
    }

    try {
      const currentHeight = (await connection.api.Block.getHeight()).height;
      this.confirmation = new BigNumber(currentHeight).minus(this.transaction.height).toFixed();

      if (this.confirmation === '1') {
        this.confirmation += ' confirmation';
      } else {
        this.confirmation += ' confirmations';
      }
    } catch (error) {
      console.log(error.message);
      // error({ statusCode: 404, message: 'Oops...' });
    }
  }
}
</script>

<style>
.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}

.el-card {
  margin-top: 20px;
}

.el-row {
  margin: 20px;
}

.el-col {
  font-weight: 500;
}

p {
  color: #acacac;
}

</style>
