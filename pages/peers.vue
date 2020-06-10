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
            {{version}} ({{count}} <span v-if="count > 1">Nodes</span> <span v-else>Node</span>) 
          </p>
        </el-col>

      </el-row>
    </el-card>
    <el-card>
      <h1>Connected Nodes</h1>
      <el-table :data="allNodes" stripe style="width: 100%">
        <el-table-column prop="ip" label="IP" width="300"></el-table-column>
        <el-table-column prop="version" label="Version" width="300"></el-table-column>
        <el-table-column prop="height" label="Height" >
        </el-table-column>
        </el-table>
    </el-card>

    <el-card>
    <d3-network :net-nodes="graphNodes" :net-links="links" :options="options">
    </d3-network>
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
    getPeersIP: async function (ipList) {
      let peersList = [];
      for (const ip of ipList) {
        // console.log({ip});
        const connection = new gnyClient.Connection(ip, 4096, process.env['GNY_NETWORK'], false);
        const systemInfo = (await connection.api.System.getSystemInfo());
        const version = systemInfo.version;
        const height = systemInfo.lastBlock.height;

        peersList.push({ip, version, height});
        console.log(`${ip}: ${JSON.stringify({ip, version, height}, null, 2)}`);
      }

      return peersList;
    }

  },

  data() {
    return {
      count: 0,
      allNodes: [],

      systemVersion: '',
      height: '',

      versionCount: {},

      graphNodes: [],
      links: [],

      options: {
        force: 3000,
        nodeSize: 20,
        nodeLabels: true,
        linkWidth: 3,
      }

    };
  },

  async mounted() {
    try {
      const peersWrapper = await connection.api.Peer.getPeers();
      this.count = peersWrapper.count + 1;

      // Peers
      const ipList = peersWrapper.peers.map(peer => peer.simple.host);
      const peersIPList = await this.getPeersIP(ipList);

      console.log({peersIPList});

       // current node info
      const systemWrapper = await connection.api.System.getSystemInfo();
      console.log(`system: ${JSON.stringify(systemWrapper, null, 2)}`);

      const versionWrapper = await connection.api.Peer.getVersion();
      console.log(`version: ${JSON.stringify(versionWrapper, null, 2)}`);

      const peersInfo = await connection.api.Peer.getInfo();
      console.log(`peersInfo: ${JSON.stringify(peersInfo, null, 2)}`);
      
      this.systemVersion = systemWrapper.version;
      this.height = systemWrapper.lastBlock.height;

      this.allNodes = this.allNodes.concat(peersIPList);

      this.allNodes.push({
        ip: peersInfo.publicIp,
        version: versionWrapper.version,
        height: this.height
      });

      this.graphNodes.push({
        id: 1,
        name: peersInfo.publicIp,
      });

      console.log(JSON.stringify(peersIPList, null, 2));

      for (const [i, node] of peersIPList.entries()) {
        this.graphNodes.push({
          id: i+2,
          name: node.ip,
        });
        this.links.push(
          {
            sid: 1,
            tid: i+2,
            _color: '#acacac',
          }
        )
      }
      
      console.log(JSON.stringify(this.graphNodes, null, 2));

      console.log(JSON.stringify(this.links, null, 2));


      for (const node of this.allNodes) {
        if (this.versionCount.hasOwnProperty(node.version)) {
          this.versionCount[node.version] += 1;
        } else {
          this.versionCount[node.version] = 1;
        }
      }


      
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
