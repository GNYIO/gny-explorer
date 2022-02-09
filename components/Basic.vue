<template>
  <b-card title="Basic" class="shadow">
    <div class="wrapper">
      <div>
        Blocks
        <br v-if="blocksCount === ''">
        <i v-if="blocksCount === ''"  class="el-icon-loading"></i>
        <p v-if="blocksCount">{{blocksCount}}</p>
      </div>
      <div>
        Transactions
        <br v-if="transactions === ''">
        <i v-if="transactions === ''"  class="el-icon-loading"></i>
        <p v-if="transactions">{{transactions}}</p>
      </div>
      <div>
        Delegates
        <br v-if="dalegates === ''">
        <i v-if="dalegates === ''"  class="el-icon-loading"></i>
        <p v-if="dalegates">{{dalegates}}</p>
      </div>
      <div>
        Accounts
        <br v-if="accounts === ''">
        <i v-if="accounts === ''"  class="el-icon-loading"></i>
        <p v-if="accounts">{{accounts}}</p>
      </div>
      <div>
        Latest block height
        <br v-if="latestHeight === ''">
        <i v-if="latestHeight === ''"  class="el-icon-loading"></i>
        <p v-if="latestHeight">{{latestHeight}}</p>
      </div>
    </div>
  </b-card>
</template>

<script>
import * as gnyClient from '@gny/client';
console.log(`endpoint: ${process.env['GNY_ENDPOINT']}`);
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  props: ['blocksCount', 'transactions', 'latestHeight'],

  data() {
    return {
      dalegates: '',
      size: 'loading',
      accounts: '',
    }
  },

  async mounted() {
    this.dalegates = (await connection.api.Delegate.getDelegates()).totalCount;
    this.nodes = (await connection.api.Peer.getPeers()).count;
    this.accounts = (await connection.api.Account.countAccounts()).count;
  },
}
</script>

<style scoped>
p {
  color: #acacac;
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
</style>
