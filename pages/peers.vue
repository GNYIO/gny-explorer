<template>
  <el-container direction="vertical">
    <el-card>
      <h1>Peers</h1>
      <el-row>
        <el-col :span="8">
          All Nodes:
          <p>{{count}}</p>
        </el-col>
        <el-col :span="16">
          System versions:
          <p v-for="(count, version) in versionCount">
            {{version}} ({{count[0]}} {{count[1]}})
          </p>
        </el-col>

      </el-row>
    </el-card>
    <el-card>
      <h1>Connected Nodes</h1>
      <el-table :data="allNodes" stripe style="width: 100%">
        <el-table-column prop="ip" label="IP" width="300"></el-table-column>
        <el-table-column prop="version" label="Version" ></el-table-column>
        </el-table>
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
import { BigNumber } from 'bignumber.js';

export default {
  methods: {
  },
  data() {
    return {
      count: 0,
      allNodes: [],

      systemVersion: '',
      height: '',

      versionCount: {},

    };
  },
  async mounted() {
    try {
      const systemWrapper = await connection.api.System.getSystemInfo();
      console.log(`system: ${JSON.stringify(systemWrapper, null, 2)}`);

      const versionWrapper = await connection.api.Peer.getVersion();
      console.log(`version: ${JSON.stringify(versionWrapper, null, 2)}`);

      const peersInfo = await connection.api.Peer.getInfo();
      console.log(`peersInfo: ${JSON.stringify(peersInfo, null, 2)}`);
      

      this.systemVersion = systemWrapper.version;
      this.height = systemWrapper.lastBlock.height;

      // current node info
      this.allNodes.push({
        ip: peersInfo.publicIp,
        version: versionWrapper.version
      })

      // {'1.0.28': [1, 'Node'], '1.0.27': [2, 'Nodes']} 
      this.versionCount[versionWrapper.version] = [1];
      this.versionCount[versionWrapper.version].push('Node');

      const peersWrapper = await connection.api.Peer.getPeers();
      this.count = peersWrapper.count + 1;

      const ipList = peersWrapper.peers.map(peer => peer.simple.host);

      ipList.forEach(async ip => {
        const connection = new gnyClient.Connection(ip, 4096, process.env['GNY_NETWORK'], process.env['GNY_HTTPS']);
        const version = (await connection.api.System.getSystemInfo()).version;
        this.allNodes.push({ip, version});
        
        if (this.versionCount.hasOwnProperty(version)) {
          this.versionCount[version][0] += 1;
        } else {
          this.versionCount[version] = [1];
          this.versionCount[version].push('Node');
        }

        if (this.versionCount[version][0] > 1) {
          this.versionCount[version][1] = 'Nodes';
        }
      });
      
    } catch (err) {
      console.log(err.message);
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


.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

</style>
