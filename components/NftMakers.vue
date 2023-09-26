<template>
  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table class="clickable-rows" :data="makers" stripe v-loading="loading">

      <el-table-column prop="name" align="center" label="name" width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'nft-maker-detail', query: { makerId: table.row.name } }">
            {{ table.row.name }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column prop="desc" align="center" label="description" :formatter="subDes"></el-table-column>

      <el-table-column prop="tid" align="center" label="Register Trs">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.tid } }">
            {{ table.row.tid.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column prop="nftCounter" align="center" label="# of NFTs created"></el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="5"
      layout="prev, pager, next" :total="makersCount" align="center"></el-pagination>
  </b-card>
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

      console.log(`offset: ${from}, limit: ${this.pageSize}, address: ${this.address}`);

      const raw = await connection.api.Nft.getNftMakers(from, this.pageSize, this.address);
      this.makers = raw.makers;
      this.makersCount = raw.count;

      console.log(`(NftMakers) makers: ${JSON.stringify(this.makers, null, 2)}`);

      this.loading = false;
    },

    subDes: function (row, column) {
      return row.desc.slice(0,8) + '...';
    },
  },
};

</script>