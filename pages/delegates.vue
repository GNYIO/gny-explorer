<template>
  <div>
    <b-card title="Delegates" class="shadow">
      <div class="wrapper">
            <div>
            All Delegates
            <p v-if="count">{{count}}</p>
            <br v-if="count === ''">
            <i v-if="count === ''"  class="el-icon-loading"></i>
            </div>
            <div>
              Most Produced Blocks
              <p v-if="mostProducedBlocks">
                <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: mostProducedBlocksDelegate }}">{{mostProducedBlocksDelegate}}</nuxt-link> mined {{mostProducedBlocks}} Blocks
              </p>
              <br v-if="mostProducedBlocksDelegate === ''">
              <i v-if="mostProducedBlocksDelegate === ''"  class="el-icon-loading"></i>
            </div>
            <div>
                Highest Approval
                <br v-if="highestApproval === ''">
                <i v-if="highestApproval === ''"  class="el-icon-loading"></i>
                <p>{{highestApproval}}</p>
            </div>
            <div>
                Forging Delegates
                <p v-if="forgingCount">{{forgingCount}}</p>
                <br v-if="forgingCount === 0">
                <i v-if="forgingCount === 0"  class="el-icon-loading"></i>
            </div>
            <div>
                Highest Approval
                <br v-if="highestApprovalDelegate === ''">
                <i v-if="highestApprovalDelegate === ''"  class="el-icon-loading"></i>
                <p>
                   <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: highestApprovalDelegate }}">
                    {{highestApprovalDelegate}}
                   </nuxt-link>
                </p>                
            </div>
      </div>
    </b-card>

    <b-card class="shadow mt-4">
      <el-table :data="allDelegates" stripe style="width: 100%" v-loading="loading">
          <el-table-column prop="rate" label="Rank" width="60" align="center"></el-table-column>
          <el-table-column
            prop="username"
            label="Username"
            align="center"
            width="auto"
          >
            <template v-slot:default="table">
              <nuxt-link class="nuxt-link" :to="{ name: 'delegate-detail', query: { username: table.row.username }}">
                    {{table.row.username}}
                   </nuxt-link>
            </template>
          </el-table-column>
          <el-table-column
            v-if="width >= 500"
            prop="prettyLockBalance"
            label="Locked Balance"
            align="center"
            width="auto"
          ></el-table-column>
          <el-table-column
            v-if="width >= 500"
            prop="prettyBalance"
            label="Unlocked Balance"
            align="center"
            width="auto"
          ></el-table-column>
          <el-table-column
            v-if="width >= 500"
            prop="producedBlocks"
            label="Produced Blocks"
            align="center"
            width="auto"
          ></el-table-column>
          <el-table-column
            v-if="width >= 500"
            prop="rewards"
            label="Rewards"
            align="center"
            :formatter="formatRewards"
            width="auto"
          ></el-table-column>
          <el-table-column
            v-if="width >= 800"
            prop="fees"
            label="Fees"
            align="center"
            :formatter="formatFees"
            width="auto"
          ></el-table-column>
          <el-table-column
            v-if="width >= 800"
            prop="missedBlocks"
            label="Missed Blocks"
            align="center"
            width="auto"
          ></el-table-column>
          <el-table-column
            v-if="width >= 800"
            prop="productivity"
            label="Productivity %"
            align="center"
            :formatter="formatProductivity"
            width="auto"
          ></el-table-column>
          <el-table-column v-if="width >= 800" prop="approval" label="Approval %" align="center" width="auto"></el-table-column>
        </el-table>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as gnyClient from '@gny/client';
const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);
import { BigNumber } from 'bignumber.js';

export default {
  computed: {
    ...mapGetters(['width']),
  },
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
        let all = [];
        for (let offset = 0; offset < count; offset += 100) {
          const part = await connection.api.Delegate.getDelegates(offset, 100);
          if (part.success) {
            all.push(...part.delegates);
          }
        }

        all = all.map(x => {
          const one = {
            ...x,
            prettyBalance: new BigNumber(x.gny).dividedBy(1e8).toFixed(0),
            prettyLockBalance: new BigNumber(x.lockAmount).dividedBy(1e8).toFixed(0),
          };
          return one;
        });
        console.log(JSON.stringify(all[0], null, 2));

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

.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

@media screen and (min-width: 500px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 700px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 850px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

p {
  color: #acacac;
}


.nuxt-link {
  color:#2475ba;
  cursor: pointer;
}

</style>
