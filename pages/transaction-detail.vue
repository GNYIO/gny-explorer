<template>
  <el-container direction="vertical">
    <el-card>
      <h2>Transaction</h2>
      <el-row>
        <el-col :span="8">
          Block height
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: transaction.height }}">
              {{transaction.height}}
            </nuxt-link>
          </p>
        </el-col>
        <el-col :span="8">
          Confirmations
          <p>{{confirmation}}</p>
        </el-col>
        <el-col :span="8">
          Forged Time
          <p>{{date}}</p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          Fee
          <p>{{transaction.fee}}</p>
        </el-col>
        <el-col :span="8">
          Transaction Type
          <p>{{transaction.type}}</p>
        </el-col>
        <el-col :span="8">
          Signatures
          <p>{{transaction.signatures | truncate(24) }}</p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24" >
          Transaction ID
          <p>{{transaction.id}}     <i class="el-icon-copy-document" @click="copyId"></i></p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          SenderId
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: transaction.senderId }}">
              {{transaction.senderId | truncate(20)}}
            </nuxt-link>
          </p>
        </el-col>
        <el-col :span="16">
          Sender Public Key
          <p>{{transaction.senderPublicKey}}</p>
        </el-col>
      </el-row>


      <el-row v-if="!!transaction && transaction.secondSignature">
        <el-col :span="24">
          Second Signature
          <p>{{transaction.secondSignature | truncate(24) }}</p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          Arguments
          <p>{{transaction.args | truncate(60)}}</p>
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
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS']|| false,
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
      confirmationText: '',
      date:'',
    }
  },

  methods: {
    async copyId() {
      try {
        await this.$copyText(this.transaction.id);
      } catch (e) {
        console.error(e);
      }
    },
  },

  async mounted() {
    const id = this.$route.query.id;

    try {
      const query = {
        id: id,
      }
      const result = (await connection.api.Transaction.getTransactions(query)).transactions;
      this.transaction = result[0]
    } catch (error) {
      console.log(error.message);
      // error({ statusCode: 404, message: 'Oops...' });
    }

    this.date = moment(slots.getRealTime(this.transaction.timestamp)).format('YYYY-MM-DD hh:mm:ss');

    try {
      const currentHeight = (await connection.api.Block.getHeight()).height;
      this.confirmation = new BigNumber(currentHeight).minus(this.transaction.height).toFixed();

      if (this.confirmation === '1') {
        this.confirmationText = ' confirmation';
      } else {
        this.confirmationText = ' confirmations';
      }
    } catch (error) {
      console.log(error.message);
      // error({ statusCode: 404, message: 'Oops...' });
    }
  }
}
</script>

<style scoped>
i {
    cursor: pointer;
}

.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}

.el-card {
  margin-top: 20px;
}

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

</style>
