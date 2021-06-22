<template>
  <el-container direction="vertical">

    <b-card title="Connected Nodes" class="shadow mt-4">
      <el-table :data="allNodes" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="peersInfo.publicIp" label="IP"></el-table-column>
        <el-table-column prop="system.version" label="version" ></el-table-column>
        <el-table-column prop="system.lastBlock.height" label="height"></el-table-column>
        <el-table-column prop="system.lastBlock.behind" label="behind"></el-table-column>
      </el-table>
    </b-card>

    <b-card class="shadow mt-4">
      <network
        :nodes="graphNodes"
        :edges="links"
        :options="options">
      </network>
    </b-card>

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
  JSON.parse(process.env['GNY_HTTPS'] || false),
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
          },
          physics: false,
        },

        nodes: {
          shape: 'dot',
          size: 10,

          scaling: {
            customScalingFunction: function (min,max,total,value) {
              return value/total;
            },
            min:5,
            max:150
          }
        },
      },
      loading: true
    };
  },

  async mounted() {

    const result = await getAllPeers(this.$axios);

    this.graphNodes.push(...result.visNodes);

    this.links.push(...result.visEdges);
    console.log(`length of result.peersList ${result.peersList.length}`);
    this.allNodes.push(...result.peersList);

    this.allNodes.sort((a, b) => {
      return new BigNumber(a.system.lastBlock.height).lt(b.system.lastBlock.height);
    });
    
    if (this.allNodes.length >= 0) {
      this.loading = false;
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
