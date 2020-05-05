<template>
  <el-container direction="vertical">
    <el-card>
      <h2>Delegate</h2>
      <el-row>
        <el-col :span="8" >
          Username
          <router-link class="clickable" :to="{ name: 'account-detail', query: { username: delegate.username }}" tag="span">
              <p >{{delegate.username}}</p>
          </router-link>
        </el-col>
        <el-col :span="8" >
          PublicKey
          <p >{{publicKey}}</p>
        </el-col>
        <el-col :span="8" >
          Address
          <router-link class="clickable" :to="{ name: 'account-detail', query: { address: delegate.address }}" tag="span">
              <p>{{delegate.address}}</p>
          </router-link>
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
  process.env['GNY_PORT'],
  process.env['GNY_NETWORK'],
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
      try {
        const delegate = (await connection.api.Delegate.getDelegateByUsername(username)).delegate;
  
        console.log(`delegate: ${JSON.stringify(delegate, null, 2)}`);
        this.delegate = delegate;
        this.publicKey = delegate.publicKey.slice(0, 8);
      } catch (error) {
        debugger;
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