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
          Sender ID
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: transaction.senderId }}">
              {{transaction.senderId | truncate(20)}}
            </nuxt-link>
          </p>
        </el-col>
        <el-col :span="16">
          Sender Public Key
          <p>{{transaction.senderPublicKey | truncate(50)}}</p>
        </el-col>
      </el-row>


      <el-row v-if="!!transaction && transaction.secondSignature">
        <el-col :span="24">
          Second Signature
          <p>{{transaction.secondSignature | truncate(24) }}</p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 0">
        <el-col :span="8">
          Amount
          <p>{{args[0]}}</p>
        </el-col>
        <el-col :span="16">
          Recipient
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { username: args[1]}}">
              {{args[1]}}
            </nuxt-link>
          </p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 1">
        <el-col :span="8">
          Username
          <p>{{username}}</p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 2">
        <el-col :span="24">
          Second Public Key
          <p>{{secondPublicKey | truncate(70)}}</p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 3">
        <el-col :span="8">
          Amount
          <p>{{amount}}</p>
        </el-col>
        <el-col :span="16">
          Lock Height
          <p>{{lockHeight}}</p>
        </el-col>
      </el-row>

       <el-row v-if="transaction.type === 4 || transaction.type === 5">
        <el-col :span="24">
          Vote List
          <p>
            <nuxt-link v-for="vote in voteList" class="nuxt-link" :key="vote" :to="{name: 'account-detail', query: { username: vote}}">
              {{vote}}
            </nuxt-link>
          </p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 100">
        <el-col :span="8">
          Username
          <p>{{username}}</p>
        </el-col>
        <el-col :span="16">
          Description
          <p>{{desc | truncate(50)}}</p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 101">
        <el-col :span="8">
          Username
          <p>{{username}}</p>
        </el-col>
        <el-col :span="8">
          Maximum
          <p>{{maximum}}</p>
        </el-col>
        <el-col :span="8">
          Precision
          <p>{{precision}}</p>
        </el-col>
      </el-row>
      <el-row v-if="transaction.type === 101">
        <el-col :span="24">
          Description
          <p>{{desc | truncate(70)}}</p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 102">
        <el-col :span="8">
          Currency
          <p>{{currency}}</p>
        </el-col>
        <el-col :span="16">
          Amount
          <p>{{amount}}</p>
        </el-col>
      </el-row>

      <el-row v-if="transaction.type === 103">
        <el-col :span="8">
          Currency
          <p>{{currency}}</p>
        </el-col>
        <el-col :span="8">
          Amount
          <p>{{amount}}</p>
        </el-col>
        <el-col :span="8">
          Recipient ID
          <p>
            <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: recipientId}}">
              {{recipientId | truncate(20)}}
            </nuxt-link>
          </p>
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
  watch: { 
    '$route.query.id': async function(id) {
      console.log(id);
      await this.updatePage(id);
    }
  },

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
      args: [],
      username: '',
      voteList: '',
      amount: '',
      lockHeight: '',
      desc: '',
      maximum: '',
      precision: 0,
      currency: '',
      recipientId: '',
      secondPublicKey: '',
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

    async updatePage(id) {
      try {
        const query = {
          id: id,
        }
        const result = (await connection.api.Transaction.getTransactions(query)).transactions;
        this.transaction = result[0]
        console.log(this.transaction);
      } catch (error) {
        console.log(error.message);
        // error({ statusCode: 404, message: 'Oops...' });
      }

      this.date = moment(slots.getRealTime(this.transaction.timestamp)).format('YYYY-MM-DD hh:mm:ss');

      this.args = JSON.parse(this.transaction.args);

      switch (this.transaction.type) {
        case 0:
          this.args[0] = new BigNumber(this.args[0]).dividedBy(1e8).toFixed();
          break;
        case 1:
          this.username = this.args[0];
          break;
        case 2:
          this.secondPublicKey = this.args[0];
          break;
        case 3:
          this.lockHeight = new BigNumber(this.args[0]).toFixed();
          this.amount = new BigNumber(this.args[1]).dividedBy(1e8).toFixed();
          break;
        case 4:
        case 5:
          this.voteList = this.args[0].split(',');
          break;
        case 100:
          this.username = this.args[0];
          this.desc = this.args[1];
          break;
        case 101:
          this.username = this.args[0];
          this.desc = JSON.stringify(this.args[1]);
          this.maximum = new BigNumber(this.args[2]).dividedBy(1e8).toFixed();
          this.precision = this.args[3];
          break;
        case 102:
          this.currency = this.args[0];
          this.amount = new BigNumber(this.args[1]).dividedBy(1e8).toFixed();
          break;
        case 103:
          this.currency = this.args[0];

          const username = (await connection.api.Account.getAccountByAddress(this.transaction.senderId)).account.username;
          const name = this.username + '.' + this.currency;
          const precisionRaw = (await connection.api.Uia.getAsset(name)).precision;
          const precision = Math.pow(10, precisionRaw);

          this.amount = new BigNumber(this.args[1]).dividedBy(precision).toFixed();
          this.recipientId = this.args[2];
          break;
      }

      this.transaction.fee = new BigNumber(this.transaction.fee).dividedBy(1e8).toFixed();

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
  },

  async mounted() {
    const id = this.$route.query.id;

    await this.updatePage(id);
    
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
