<template>
  <div>
    <b-card title="Account info" class="shadow">
      <div class="wrapper">
        <div>
          Address
          <p>{{ account.address }}</p>
        </div>
        <div>
          Unlocked Balance
          <br v-if="balance === ''">
          <i v-if="balance === ''" class="el-icon-loading"></i>
          <p>{{ balance }}</p>
        </div>
        <div>
          Locked Balance
          <p>{{ lockAmount }}</p>
        </div>
        <div>
          Is Locked
          <p>{{ isLocked }}</p>
        </div>
        <div>
          Lock Height
          <p>{{ lockHeight }}</p>
        </div>
        <div>
          Username
          <p v-if="account.username">{{ account.username }}</p>
          <p v-else>Not set</p>
        </div>
        <div>
          Public Key
          <p v-if="publicKey">{{ publicKey }}</p>
          <p v-else>Not set</p>
        </div>
        <div>
          Delegate
          <p v-if="account.isDelegate"><nuxt-link
              :to="{ name: 'delegate-detail', query: { username: account.username } }">Details</nuxt-link></p>
          <p v-else>False</p>
        </div>
      </div>
    </b-card>

    <visualization-component :address="address" ></visualization-component>

    <custom-assets-component :senderAddress="address"></custom-assets-component>

    <transactions-i-sent-component :senderAddress="address"></transactions-i-sent-component>

    <asset-transfers-component :senderAddress="address"></asset-transfers-component>

    <who-i-voted-for-component :addressOfVoter="address"></who-i-voted-for-component>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import * as gnyClient from '@gny/client';

import TransactionsISentComponent from '../components/TransactionsISent.vue';
import WhoIVotedForComponent from '../components/WhoIVotedFor.vue';
import CustomAssetsComponent from '../components/CustomAssets.vue';
import AssetTransfersComponent from '../components/AssetTransfers.vue';
import VisualizationComponent from '../components/Visualization.vue';


const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  components: {
    'transactions-i-sent-component': TransactionsISentComponent,
    'who-i-voted-for-component': WhoIVotedForComponent,
    'custom-assets-component': CustomAssetsComponent,
    'asset-transfers-component': AssetTransfersComponent,
    'visualization-component': VisualizationComponent,
  },
  computed: {
    ...mapGetters(['width']),
  },
  watch: {
    '$route.query.username': async function (username) {
      console.log(`(account-detail) username changed`);
      await this.updatePage(username, null);
    },

    '$route.query.address': async function (address) {
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

      currentTransfers: [],
      currentPage: 1,
      pageSize: 10,
      limit: 100,
      offset: 0,
    }
  },

  methods: {

    updatePage: async function (username, address) {
      console.log('updatePage');
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
    },
  },

  async mounted() {
    console.log(`(account-detail) mounted()`);
    const address = this.$route.query.address;
    const username = this.$route.query.username;

    await this.updatePage(username, address);
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
  color: #2475ba;
  cursor: pointer;
}
</style>
