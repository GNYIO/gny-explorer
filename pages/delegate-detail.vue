<template>
  <el-container direction="vertical">
    <el-card>
      <h2>Delegate</h2>
      <el-row>
        <el-col :span="8" >
          Username
          <nuxt-link class="clickable" :to="{ name: 'account-detail', query: { username: delegate.username }}" tag="span">
              <p >{{delegate.username}}</p>
          </nuxt-link>
        </el-col>
        <el-col :span="8" >
          PublicKey
          <p >{{publicKey}}</p>
        </el-col>
        <el-col :span="8" >
          Address
          <nuxt-link class="clickable" :to="{ name: 'account-detail', query: { address: delegate.address }}" tag="span">
              <p>{{delegate.address}}</p>
          </nuxt-link>
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
          <p >{{delegate.rewards}}</p>
        </el-col>
      </el-row>

      <el-row>
          <el-col :span="8">
              Rank
              <p>{{delegate.rate}}</p>
          </el-col>
          <el-col :span="8">
              Approval
              <p>{{delegate.approval}}</p>
          </el-col>
          <el-col :span="8">
              Productivity
              <p>{{delegate.productivity}}</p>
          </el-col>
      </el-row>
    </el-card>

  </el-container>
</template>

<script>
import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS']|| false,
);

export default {
    data() {
      return {
        delegate: {},
        publicKey: '',
      }
    },

    async mounted() {
      const username = this.$route.query.username;
      const publicKey = this.$route.query.publicKey;
      console.log(`publicKey: ${publicKey}`);

      console.log(`delegate-detail: ${username}`);
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
      } catch (error) {
        error({ statusCode: 404, message: 'Oops...' })
      }
    }
};

</script>

<style scoped>
.clickable {
    cursor: pointer;
}

.el-container {
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0px auto;
  padding: 20px 20px;
}
</style>