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
          <p >{{id}}</p>
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
          Reward
          <p >{{block.reward}}</p>
        </el-col>
        <el-col :span="8" >
          Delegate
          <el-tooltip content="Bottom center" placement="bottom" effect="light">
            <div slot="content">{{block.delegate}}</div>
            <router-link :to="{ name: 'delegate-detail', query: { publicKey: block.delegate }}">
              <p >{{delegateID}}</p>
            </router-link>
            
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>
    <el-card>
      <h2>Transactions included in this block</h2>
      
      <el-table class="clickable-rows" @row-click="rowClick" :data="transactions" stripe style="width: 95%; margin: auto;">
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
  process.env['GNY_HTTPS'],
);



export default {
  data() {
    return {
      block: {},
      id: '',
      date: '',
      delegateID: '',
      transactions: [],
    }
  },

  methods: {
    rowClick: function(row) {
        console.log(row.id);
        this.$router.push({name: 'transaction', query: { id: row.id }});
    },

    subID: function (row, column) {
      return row.id.slice(0,8);
    },

    subSenderId: function (row, column) {
      return row.senderId.slice(0,8);
    },

    timestamp2date: function (row, column) {
      return moment(slots.getRealTime(row.timestamp)).format('YYYY-MM-DD hh:mm:ss');
    },
  },

  async mounted() {
    const height = this.$route.query.height;
    try {
      const block = (await connection.api.Block.getBlockByHeight(height)).block;
      const transactions = (await connection.api.Transaction.getTransactions({
          height: height,
      })).transactions;

      this.block = block
      this.id = this.block.id.slice(0, 8);
      this.date = moment(slots.getRealTime(this.block.timestamp)).format('YYYY-MM-DD hh:mm:ss');
      this.transactions = transactions;
      this.delegateID = this.block.delegate.slice(0, 8);

      await this.$store.dispatch('setTransactions', this.transactions);
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

/* row clickable */
.clickable-rows tbody tr td {
  cursor: pointer;
}

.clickable-rows .el-table__expanded-cell {
  cursor: default;
}

</style>
