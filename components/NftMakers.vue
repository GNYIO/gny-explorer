<template>
  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table class="clickable-rows" :data="makers" stripe v-loading="loading">
      <el-table-column prop="amount" align="center" label="Amount"></el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="5"
      layout="prev, pager, next" :total="makersCount" align="center"></el-pagination>
  </b-card>
</template>


<script>
import { mapGetters } from 'vuex';
import * as gnyClient from '@gny/client';
import BigNumber from 'bignumber.js';



const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    ...mapGetters(['width']),
    formatTitle() {
      return 'My Registered NFTMakers ' + '(total: ' + this.makersCount + ')';
    },
  },
  data() {
    return {
      loading: true,

      makers: [],
      makersCount: 0,

      currentPage: 1,
      pageSize: 5,
    };
  },
  props: {
    address: {
      required: true,
      type: String,
    }
  },

  watch: {
    address: async function (address) {
      console.log(`(NftMakers) address changed to "${this.address}"`);

      // reset
      this.makers = [];
      this.makersCount = 0;

      if (this.address === null || this.address === undefined || this.address === '') {
        console.log(`(NftMakers) address is "undefined"`);
        return;
      }

      await this.handleCurrentChange(1);
    },
  },

  methods: {
    handleCurrentChange: async function (currentPage) {
      this.loading = true;
      console.log(`(NftMakers) load data for page "${currentPage}"`);

      const from = (currentPage - 1) * this.pageSize;

      const raw = await connection.api.Nft.getNftMakers(from, this.pageSize, this.address);
      this.makers = raw.burn;
      this.makersCount = raw.count;

      console.log(`(NftMakers) makers: ${JSON.stringify(this.makers, null, 2)}`);

      this.loading = false;
    }
  },
};

</script>