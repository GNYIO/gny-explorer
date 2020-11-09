<template>
  <el-container direction="vertical">
    <b-card title="Delegate" class="shadow">
      <el-row>
        <el-col :span="8" >
          Username
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { username: delegate.username }}">{{delegate.username}}</nuxt-link>
          </p>
        </el-col>
        <el-col :span="8" >
          Public Key
          <p>{{publicKey}}</p>
        </el-col>
        <el-col :span="8" >
          Address
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: delegate.address }}">{{delegate.address}}</nuxt-link>
          </p>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8" >
          Produced Blocks
          <p >{{delegate.producedBlocks}}</p>
        </el-col>
        <el-col :span="8" >
          Missed Blocks
          <p >{{delegate.missedBlocks}}</p>
        </el-col>
        <el-col :span="8" >
          Rewards
          <p >{{rewards}} GNY</p>
        </el-col>
      </el-row>

      <el-row>
          <el-col :span="8">
              Rank
              <p># {{delegate.rate}}</p>
          </el-col>
          <el-col :span="8">
              Approval
              <p>{{delegate.approval}}</p>
          </el-col>
          <el-col :span="8">
              Productivity
              <p>{{delegate.productivity}} / 1</p>
          </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="24">
          Registration Transaction
          <p>
            <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: delegate.tid }}">
              {{trs}}
            </nuxt-link>
          </p>
        </el-col>
      </el-row>
    </b-card>

  </el-container>
</template>

<script>
import * as gnyClient from '@gny/client';
import BigNumber from 'bignumber.js';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  watch: { 
    '$route.query.username': async function(username) {
      console.log(username);
      await this.updatePage(username, null);
    },

    '$route.query.publicKey': async function(publicKey) {
      console.log(publicKey);
      await this.updatePage(null, publicKey);
    }
  },

  data() {
    return {
      delegate: {},
      publicKey: '',
      trs: '',
      rewards: '',
    }
  },

  methods: {
    updatePage: async function (username, publicKey) {
      try {
        let delegate = null;
        if (username) {
          const result = await connection.api.Delegate.getDelegateByUsername(username);
          if (result.success) {
            delegate = result.delegate;
          }
        }

        if (publicKey) {
          const result = await connection.api.Delegate.getDelegateByPubKey(publicKey);
          if (result.success) {
              delegate = result.delegate;
        }
      }

      console.log(`delegate: ${JSON.stringify(delegate, null, 2)}`);
      this.delegate = delegate;
      this.publicKey = delegate.publicKey.slice(0, 8);
      this.trs = delegate.tid.slice(0, 8);
      this.rewards = new BigNumber(delegate.rewards).dividedBy(1e8).toFixed();
      } catch (error) {
        console.log(`error(delegate-detail): ${JSON.stringify(error && error.response && error.response.data, null, 2)}`);
        error({ statusCode: 404, message: 'Oops...' })
      }
    }
  },

  async mounted() {
    const username = this.$route.query.username;
    const publicKey = this.$route.query.publicKey;
    console.log(`publicKey: ${publicKey}`);
    
    await this.updatePage(username, publicKey);
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

.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}
</style>