<template>
  <el-container direction="vertical">
    <el-card>
      <h1>Peers</h1>
      <el-row>
        <el-col :span="8">
          All Nodes:
          <p>{{count}}</p>
        </el-col>
        <el-col :span="8">
          System version:
          <p >
            {{systemVersion}}
          </p>
        </el-col>
        <el-col :span="8">
          Last block height:
          <p >
            {{height}}
          </p>
        </el-col>

      </el-row>
    </el-card>
    <el-card>
      <h1>Connected Nodes</h1>
      <el-table :data="allNodes" stripe style="width: 100%">
        <el-table-column prop="ip" label="IP" width="300"></el-table-column>
        <el-table-column prop="id" label="ID" ></el-table-column>
      </el-table>
    </el-card>

    <el-card>
    <!-- <d3-network :net-nodes="graphNodes" :net-links="links" :options="options">
    </d3-network> -->
      <network
        :nodes="graphNodes"
        :edges="links"
        :options="options">
      </network>
    </el-card>
  </el-container>
</template>

<script>

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  process.env['GNY_HTTPS']|| false,
);
import { BigNumber } from 'bignumber.js';
import { getAllPeers } from '../helpers/getAllPeers';

export default {

  data() {
    return {
      count: 0,
      allNodes: [],

      systemVersion: '',
      height: '',

      versionCount: {},

      graphNodes: [],
      links: [],

      // settings for peer graph
      options: {
        autoResize: true,
        height: '500px',
        width: '100%',

        edges: {
          arrows: {
            to: {
              enabled: true,
            }
          }
        },

        nodes: {
          shape: 'dot',
          scaling: {
            customScalingFunction: function (min,max,total,value) {
              return value/total;
            },
            min:5,
            max:150
          }
        }
      }

    };
  },

  async mounted() {
    const result = await getAllPeers();
    console.log(`result: ${JSON.stringify(result, null, 2)}`);

    this.graphNodes.push(...result.visNodes);
    this.links.push(...result.visEdges);

    // try {
    //   const peersWrapper = await connection.api.Peer.getPeers();

    //   if (peersWrapper.success === false) {
    //       return;
    //   }

    //   this.count = peersWrapper.count + 1;

    //   const result = {};
    //   console.log(`peersWrapper: ${JSON.stringify(peersWrapper, null, 2)}`);
    //   // peersWrapper.peers.
    //   for (let i = 0; i < peersWrapper.peers.length; ++i) {
        
    //     const ip = peersWrapper.peers[i].simple.host;
    //     const port = Number(peersWrapper.peers[i].simple.port) - 1;
    //     const url = `.netlify/functions/serverless-http?ip=${ip}&port=${port}&networkType=localnet`;
    //     console.log(`[${ip}] URL(top) ${url}`);

    //     let request = null;
    //     try {
    //         request = await this.$axios.get(url);
    //         result[ip] = request.data;
    //     } catch (err) {
    //         console.log(`request failed for (top): [${ip}]`);
    //     }

    //     for (let k = 0; k < request.data.peers.length; ++k) {
    //         const peer = request.data.peers[k];
    //         const peerIp = peer.simple.host;
    //         const peerPort = Number(peer.simple.port) - 1;

    //         if (!result[peerIp]) {
    //             console.log(`[${peerIp}] is NOT here`);

    //             const x = `.netlify/functions/serverless-http?ip=${peerIp}&port=${peerPort}&networkType=localnet`;
    //             console.log(`[${ip} URL(child) ${x}`);

    //             try {
    //                 const newRequest = await this.$axios.get(x);

    //                 result[peerIp] = newRequest.data;
    //             } catch (err) {
    //                 console.log(`request failed for (child): [${peerIp}]`)
    //             }

    //         } else {
    //             console.log(`[${peerIp}] is already fetched`);
    //         }

    //         await sleep(1000);
    //     }
    //   }

      // Peers nodes list
    //   const peersList = peersWrapper.peers.map(peer => {
    //     return {
    //       ip: peer.simple.host,
    //       id: peer.id.id,
    //     }
    //   });


       // current node info
    //   const systemWrapper = await connection.api.System.getSystemInfo();
    //   console.log(`system: ${JSON.stringify(systemWrapper, null, 2)}`);

    //   const versionWrapper = await connection.api.Peer.getVersion();
    //   console.log(`version: ${JSON.stringify(versionWrapper, null, 2)}`);

    //   const peersInfo = await connection.api.Peer.getInfo();
    //   console.log(`peersInfo: ${JSON.stringify(peersInfo, null, 2)}`);
      
    //   this.systemVersion = systemWrapper.version;

    //   // latest block
    //   this.height = systemWrapper.lastBlock.height;

    //   this.allNodes = this.allNodes.concat(peersList);

    //   // push current node to the end
    //   this.allNodes.push({
    //     ip: peersInfo.publicIp,
    //     id: peersInfo.id,
    //   });

      // Peer Graph
      // set id = 1 to current node
    //   this.graphNodes.push({
    //     id: peersInfo.publicIp,
    //     name: peersInfo.publicIp,
    //     _color: '#67a8af'
    //   });

    //   // set peer nodes id from 2 and links to current node (id = 1)
    //   for (const [i, peer] of peersList.entries()) {
    //     this.graphNodes.push({
    //       id: peer.ip,
    //       name: peer.ip,
    //       _color: '#67a8af',
    //       label: peer.ip
    //     });
    //     this.links.push(
    //       {
    //         id: i,
    //         from: peersInfo.publicIp,
    //         to: peer.ip,
    //         _color: '#acacac',
    //       }
    //     )
    //   }
      
    //   console.log(JSON.stringify(this.graphNodes, null, 2));
    //   console.log(JSON.stringify(this.links, null, 2));
      
    // } catch (err) {
    //   console.log(err);
    // }
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
