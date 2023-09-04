<template>
  <div>
    <b-card :title="formatTitle" class="shadow">
      <div class="wrapper">
      <div>
        Block height
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'block-detail', query: { height: transaction.height }}">
            {{transaction.height}}
          </nuxt-link>
        </p>
      </div>
      <div>
        Confirmations
        <p>{{confirmation}}</p>
      </div>
      <div>
        Forged Time
        <p>{{date}}</p>
      </div>
      <div>
        Fee
        <p>{{transaction.fee}}</p>
      </div>
      <div>
        Transaction Type
        <p>{{transaction.type}}</p>
      </div>
      <div>
        Signature
        <p>{{transaction.signatures | truncate(24) }}       <i class="el-icon-copy-document" @click="copySignature"></i></p>
      </div>

      <div>
        Transaction ID
        <p>{{transaction.id | truncate(24) }}     <i class="el-icon-copy-document" @click="copyId"></i></p>
      </div>

      <div>
        Sender ID
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: transaction.senderId }}">
            {{transaction.senderId | truncate(20)}}
          </nuxt-link>
        </p>
      </div>

      <div>
        Sender Public Key
        <p>{{transaction.senderPublicKey | truncate(24)}}<i class="el-icon-copy-document" @click="copySenderPublicKey"></i></p>
      </div>


      <div v-if="!!transaction && transaction.secondSignature">
        Second Signature
        <p>{{transaction.secondSignature | truncate(24) }} <i class="el-icon-copy-document" @click="copySecondSignature"></i> </p>
      </div>

      <div v-if="transaction.type === 0">
        Amount
        <p>{{args[0]}}</p>
      </div>
      <div v-if="transaction.type === 0">
        Recipient
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: args[1]}}">
            {{args[1]}}
          </nuxt-link>
        </p>
      </div>

      <div v-if="transaction.type === 1">
        Username
        <p>{{username}}</p>
      </div>

      <div v-if="transaction.type === 2">
        Second Public Key
        <p>{{secondPublicKey | truncate(24)}}  <i class="el-icon-copy-document" @click="copySecondSenderPubilcKey"></i></p>
      </div>

      <div v-if="transaction.type === 3">
        Lock Amount
        <p>{{amount}} GNY</p>
      </div>
      <div v-if="transaction.type === 3">
        Lock Height
        <p>{{lockHeight}}</p>
      </div>


      <div v-if="transaction.type === 4 || transaction.type === 5">
        Vote List
        <p>
          <nuxt-link v-for="vote in voteList" class="nuxt-link" :key="vote" :to="{name: 'account-detail', query: { username: vote}}">
            {{vote}}
          </nuxt-link>
        </p>
      </div>

      <div v-if="transaction.type === 20">
        Burned GNY
        <p>{{ burnedGNY }} GNY</p>
      </div>


      <!--transaction type 100 start-->
      <div v-if="transaction.type === 100">
        Registered Asset Issuer
        <p>{{username}}</p>
      </div>
      <div v-if="transaction.type === 100">
        Registered Asset Issuer Description
        <p>{{desc | truncate(50)}}</p>
      </div>
      <!--transaction type 100 start-->


      <!--transaction type 101 start-->
      <div v-if="transaction.type === 101">
        Created Asset Name
        <p>{{username}}</p>
      </div>
      <div v-if="transaction.type === 101">
        Created Asset Maximum
        <p>{{maximum}}</p>
      </div>
      <div v-if="transaction.type === 101">
        Created Asset Precision
        <p>{{precision}}</p>
      </div>
      <div v-if="transaction.type === 101">
        Created Asset Description
        <p>{{desc | truncate(70)}}</p>
      </div>
      <!--transaction type 101 end-->


      <!--transaction type 102 start-->
      <div v-if="transaction.type === 102">
        Minted Currency Amount
        <p>{{amount}} {{currency}}</p>
      </div>
      <!--transaction type 102 end-->


      <!--transaction type 103 start-->
      <div v-if="transaction.type === 103">
        Asset Transfer Amount
        <p>{{amount}} {{currency}}</p>
      </div>
      <div v-if="transaction.type === 103">
        Recipient ID
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'account-detail', query: { address: recipientId}}">
            {{recipientId | truncate(20)}}
          </nuxt-link>
        </p>
      </div>
      <!--transaction type 103 end-->


      <!--transaction type 300 start-->
      <div v-if="transaction.type === 300">
        NFT Maker Name
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'nft-maker-detail', query: { makerId: nftMakerName }}">
            {{ nftMakerName | truncate(12) }}
          </nuxt-link>
        </p>
      </div>
      <div v-if="transaction.type === 300">
        NFT Maker Description
        <p>{{ nftMakerDesc }}</p>
      </div>
      <!--transaction type 300 end-->

      <!--transaction type 301 start-->
      <div v-if="transaction.type === 301">
        NFT Name
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'nft-detail', query: { name: nftName }}">
            {{ nftName | truncate(12) }}
          </nuxt-link>
        </p>
      </div>
      <div v-if="transaction.type === 301">
        NFT Hash 
        <p>
          <nuxt-link class="nuxt-link" :to="{name: 'nft-detail', query: { hash: nftHash }}">
            {{ nftHash | truncate(12) }}
          </nuxt-link>
        </p>
      </div>
      <div v-if="transaction.type === 301">
        
      </div>
      <!--transaction type 301 end-->

      <div v-if="!!message">
        Message
        <el-tooltip class="item" effect="light" :content="message" placement="bottom">
          <p>{{message | truncate(25)}}</p> 
        </el-tooltip>
      </div>

    </div>
    </b-card>
  </div>
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
  JSON.parse(process.env['GNY_HTTPS'] || false),
);


export default {
  watch: { 
    '$route.query.id': async function(id) {
      console.log(id);
      await this.updatePage(id);
    }
  },
  computed: {
    formatTitle() {
      if (this.transaction && this.transaction.type === 0) {
        return 'Transaction - GNY Transfer';
      }
      if (this.transaction && this.transaction.type === 1) {
        return 'Transaction - Set Username';
      }
      if (this.transaction && this.transaction.type === 2) {
        return 'Transaction - Set Second Password';
      }
      if (this.transaction && this.transaction.type === 3) {
        return 'Transaction - Lock GNY';
      }
      if (this.transaction && this.transaction.type === 4) {
        return 'Transaction - Vote for Delegate';
      }
      if (this.transaction && this.transaction.type === 5) {
        return 'Transaction - Unvote Delegate';
      }
      if (this.transaction && this.transaction.type === 6) {
        return 'Transaction - Unlock GNY';
      }
      if (this.transaction && this.transaction.type === 10) {
        return 'Transaction - Register Delegate';
      }
      if (this.transaction && this.transaction.type === 20) {
        return 'Transaction - Burn GNY';
      }

      if (this.transaction && this.transaction.type === 100) {
        return 'Transaction - Register Asset Issuer';
      }
      if (this.transaction && this.transaction.type === 101) {
        return 'Transaction - Register Asset';
      }
      if (this.transaction && this.transaction.type === 102) {
        return 'Transaction - Mint Asset';
      }
      if (this.transaction && this.transaction.type === 103) {
        return 'Transaction - Transfer Asset';
      }

      if (this.transaction && this.transaction.type === 300) {
        return 'Transaction - Create NFT Maker';
      }
      if (this.transaction && this.transaction.type === 301) {
        return 'Transaction - Create NFT';
      }

      // fallback
      return 'Custom Transaction Name';
    },
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
      message: '',
      burnedGNY: '',

      nftMakerName: '',
      nftMakerDesc: '',

      nftName: '',
      nftHash: '',
      nftMakerId: '',
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
    async copySignature() {
      try {
        await this.$copyText(JSON.stringify(this.transaction.signatures));
      } catch (e) {
        console.error(e);
      }
    },
    async copySecondSignature() {
      try {
        await this.$copyText(JSON.stringify(this.transaction.secondSignature));
      } catch (e) {
        console.error(e);
      }
    },
    async copySenderPublicKey() {
      try {
        await this.$copyText(this.transaction.senderPublicKey);
      } catch (e) {
        console.error(e);
      }
    },
    async copySecondSenderPubilcKey() {
      try {
        await this.$copyText(this.secondPublicKey);
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

      this.date = moment.utc(slots.getRealTime(this.transaction.timestamp)).format('YYYY-MM-DD HH:mm:ss UTC');

      this.args = JSON.parse(this.transaction.args);
      this.message = this.transaction.message;
      console.log(this.message);

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
        case 20:
          this.burnedGNY = this.args[0] === String(0) ? String(0) : new BigNumber(this.args[0]).dividedBy(1e8).toFixed(0);
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
          this.username = (await connection.api.Account.getAccountByAddress(this.transaction.senderId)).username;

          const name = this.currency;
          const precisionRaw = (await connection.api.Uia.getAsset(name)).asset.precision;
          const precision = Math.pow(10, precisionRaw);

          this.amount = new BigNumber(this.args[1]).dividedBy(precision).toFixed();
          this.recipientId = this.args[2];
          break;
        case 300:
          this.nftMakerName = this.args[0];
          this.nftMakerDesc = this.args[1];
          break;
        case 301:
          this.nftName = this.args[0];
          this.nftHash = this.args[1];
          this.nftMakerId = this.args[2];
          break;
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

.el-icon-copy-document {
  transition: 0.1s;
  transition-property: color;
}

.el-icon-copy-document:hover {
  color: #565656;
}

.el-icon-copy-document:active {
  color: black;
}

</style>
