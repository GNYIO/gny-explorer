<template>
  <el-container direction="vertical">
    <b-card title="Delegates" class="shadow">
        <el-row>
            <el-col :span="8">
            All Delegates
            <p v-if="count">{{count}}</p>
            <br v-if="count === ''">
            <i v-if="count === ''"  class="el-icon-loading"></i>
            </el-col>
            <el-col :span="8">
              Most Produced Blocks
              <p v-if="mostProducedBlocks">{{mostProducedBlocks}}</p>
              <br v-if="mostProducedBlocks === ''">
              <i v-if="mostProducedBlocks === ''"  class="el-icon-loading"></i>
              
            </el-col>
            <el-col :span="8">
                Highest Approval
                <br v-if="highestApproval === ''">
                <i v-if="highestApproval === ''"  class="el-icon-loading"></i>
                <p>{{highestApproval}}</p>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="8">
                Forging Delegates
                <!-- <p>{{forgingCount}}</p> -->
                <p v-if="forgingCount">{{forgingCount}}</p>
                <br v-if="forgingCount === 0">
                <i v-if="forgingCount === 0"  class="el-icon-loading"></i>
            </el-col>
            <el-col :span="8">
                Most Produced Blocks Delegate
                <br v-if="mostProducedBlocksDelegate === ''">
                <i v-if="mostProducedBlocksDelegate === ''"  class="el-icon-loading"></i>
                <p>
                  <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: mostProducedBlocksDelegate }}">
                  {{mostProducedBlocksDelegate}}
                  </nuxt-link>
                </p>
                
            </el-col>
            <el-col :span="8">
                Highest Approval Name
                <br v-if="highestApprovalDelegate === ''">
                <i v-if="highestApprovalDelegate === ''"  class="el-icon-loading"></i>
                <p>
                   <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: highestApprovalDelegate }}">
                    {{highestApprovalDelegate}}
                   </nuxt-link>
                </p>
                
            </el-col>
        </el-row>

    </b-card>
    <b-card class="shadow mt-4">
      <el-table :data="allDelegates" stripe style="width: 100%" v-loading="loading">
          <el-table-column prop="rate" label="Rank" width="60" align="center"></el-table-column>
          <el-table-column
            prop="username"
            label="Username"
            width="120"
            align="center"
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
            width="100"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="rewards"
            label="Rewards"
            width="80"
            align="center"
            :formatter="formatRewards"
          ></el-table-column>
          <el-table-column
            prop="fees"
            label="Fees"
            width="100"
            align="center"
            :formatter="formatFees"
          ></el-table-column>
          <el-table-column
            prop="missedBlocks"
            label="Missed Blocks"
            width="130"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="productivity"
            label="Productivity %"
            align="center"
            :formatter="formatProductivity"
          ></el-table-column>
          <el-table-column prop="approval" label="Approval %" width="110" align="center"></el-table-column>
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
  JSON.parse(process.env['GNY_HTTPS'] || false),
);
import { BigNumber } from 'bignumber.js';

export default {
  methods: {
    handleCurrentChange: function(row) {
      console.log(row.username);
      this.$router.push({name: 'delegate-detail', query: { username: row.username }});
    },

    formatRewards: function (row, column) {
      return new BigNumber(row.rewards).dividedBy(1e8).toFixed();
    },

    formatFees: function (row, column) {
      BigNumber.set({ DECIMAL_PLACES: 2 });
      return new BigNumber(row.fees).dividedBy(1e8).toFixed();
    },

    formatProductivity: function (row, column) {
      return new BigNumber(row.productivity).times(100).decimalPlaces(4).toFixed();
    },
  },
  data() {
    return {
      allDelegates: [],
      count: '',
      forgingCount: 0,

      mostProducedBlocks: '',
      mostProducedBlocksDelegate: '',

      highestApproval: '',
      highestApprovalDelegate: '',
      loading: true,
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

        this.highestApproval = highestApproval.approval + ' %';
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

        if (this.allDelegates.length >= 0) {
          this.loading = false;
        }

        let enabledCount = 0;

        for (const delegate of this.allDelegates) {
          const enabled = (await connection.api.Delegate.forgingStatus(delegate.publicKey)).enabled;
          if (enabled) {
            enabledCount += 1;
          }
        }
        this.forgingCount = enabledCount;

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
