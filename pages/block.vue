<template>
  <el-container direction="vertical">
    <el-card>
      <el-row>
        <el-col :span="8" >
          Height
          <p >{{block.height}}</p>
        </el-col>
        <el-col :span="8" >
          ID
          <p >{{subID}}</p>
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
          Transaction Fees
          <p >{{block.fees}}</p>
        </el-col>
        <el-col :span="8" >
          Reward
          <p >{{block.reward}}</p>
        </el-col>
      </el-row>
    </el-card>
    <el-card>
      <h2>Transactions included in this block</h2>
      
      <el-table :data="transactions" stripe style="width: 95%; margin: auto;">
        <el-table-column prop="height" align="center" label="Height" width="150"></el-table-column>
        <el-table-column prop="id" align="center" label="Transaction ID" width="200" :formatter="subID"></el-table-column>
        <el-table-column prop="timestamp" align="center" label="Forged Time" width="200" :formatter="timestamp2date"></el-table-column>
        <!-- <el-table-column prop="fees" align="center" label="Fee"></el-table-column> -->
        <el-table-column prop="delegate" align="center" label="Delegate" width="200" :formatter="subDelegate"></el-table-column>
      </el-table>
    </el-card>
  </el-container>
</template>

<script>
import moment from 'moment';
import * as gnyClient from '@gny/client';
import { slots } from '@gny/utils';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
);



export default {
  data() {
    return {
      block: {},
      subID: '',
      date: '',
      transactions: [],
    }
  },

  methods: {
    subID: function (row, column) {
      return row.id.slice(0,8);
    },

    subDelegate: function (row, column) {
      return row.delegate.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },
  },

  async mounted() {
    const height = this.$route.query.height;
    try {
      this.block  = (await connection.api.Block.getBlockByHeight(height)).block;
      this.subID = this.block.id.slice(0, 8);
      this.date = moment(slots.getRealTime(this.block.timestamp)).format('YYYY-MM-DD hh:mm:ss');
      this.transactions = this.block.transactions;
    } catch (error) {
      error({ statusCode: 404, message: 'Oops...' })
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

.el-col {
  font-weight: 500;
}

p {
  color: #acacac;
}

</style>
