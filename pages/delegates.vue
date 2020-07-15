<template>
  <el-container direction="vertical">
    <b-card class="shadow">
        <h1>Delegates</h1>
        <el-row>
            <el-col :span="8">
            All Delegates
            <p>{{count}}</p>
            </el-col>
            <el-col :span="8">
              Most Produced Blocks
              <p>{{mostProducedBlocks}}</p>
            </el-col>
            <el-col :span="8">
                Highest Approval
                <p>{{highestApproval}} %</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                Forging Delegates
                <p>101</p>
            </el-col>
            <el-col :span="8">
                Most Produced Blocks Delegate
                <p>
                  <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: mostProducedBlocksDelegate }}">
                  {{mostProducedBlocksDelegate}}
                  </nuxt-link>
                </p>
            </el-col>
            <el-col :span="8">
                Highest Approval Name
                <p>
                   <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: highestApprovalDelegate }}">
                    {{highestApprovalDelegate}}
                   </nuxt-link>
                </p>
            </el-col>
        </el-row>

    </b-card>
    <b-card class="shadow mt-4">
      <el-table :data="allDelegates" stripe style="width: 100%">
          <el-table-column prop="rate" label="Rank" width="100"></el-table-column>
          <el-table-column
            prop="username"
            label="Username"
            width="120"
          >
            <template v-slot:default="table">
              <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: table.row.username }}">
                    {{table.row.username}}
                   </nuxt-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="producedBlocks"
            label="Produced Blocks"
            width="140"
          ></el-table-column>
          <el-table-column
            prop="rewards"
            label="Rewards"
            width="140"
          ></el-table-column>
          <el-table-column
            prop="productivity"
            label="Productivity"
          ></el-table-column>
          <el-table-column prop="approval" label="Approval %" width="100"></el-table-column>
        </el-table>
    </b-card>
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
    handleCurrentChange: function(row) {
      console.log(row.username);
      this.$router.push({name: 'delegate-detail', query: { username: row.username }});
    },
  },
  data() {
    return {
      allDelegates: [],
      count: 101,

      mostProducedBlocks: '',
      mostProducedBlocksDelegate: '',

      highestApproval: '',
      highestApprovalDelegate: '',
    };
  },
  async mounted() {
    try {
      const countWrapper = await connection.api.Delegate.count();
      if (countWrapper.success === true) {
        const count = countWrapper.count;
        const all = [];
        for (let offset = 0; offset < count; offset += 100) {
          const part = await connection.api.Delegate.getDelegates(offset, 100);
          if (part.success) {
            all.push(...part.delegates);
          }
        }

        this.allDelegates = all;
        this.count = all.length;

        // Array.sort() changes own array (not only returned value)
        const copy = JSON.parse(JSON.stringify(all));


        // approval
        const highestApproval = copy.sort((a, b) => {
            if (new BigNumber(a.approval).isGreaterThan(b.approval)) {
                return -1;
            }

            if (new BigNumber(a.approval).isLessThan(b.approval)) {
                return 1;
            }

            return 0;
        })[0];

        this.highestApproval = highestApproval.approval;
        this.highestApprovalDelegate = highestApproval.username;



        // produced Blocks
        const copy2 = JSON.parse(JSON.stringify(all));

        const mostProducedBlocks = copy2.sort((a, b) => {
            if (new BigNumber(a.producedBlocks).isGreaterThan(b.producedBlocks)) {
                return -1;
            }

            if (new BigNumber(a.producedBlocks).isLessThan(b.producedBlocks)) {
                return 1;
            }

            return 0;
        })[0];

        this.mostProducedBlocks = mostProducedBlocks.producedBlocks;
        this.mostProducedBlocksDelegate = mostProducedBlocks.username;

      } else {
        this.allDelegates = [];
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
