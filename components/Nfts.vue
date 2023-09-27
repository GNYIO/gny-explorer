<template>
  <b-card :title="formatTitle" class="shadow mt-4">
    <el-table class="clickable-rows" :data="nfts" stripe v-loading="loading">
      <el-table-column prop="name" align="center" label="Nft Name" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'nft-detail', query: { name: table.row.name } }">
              {{ table.row.name | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 600" prop="hash" align="center" label="Nft Hash" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'nft-detail', query: { hash: table.row.hash } }">
              {{ table.row.hash | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 600" prop="previousHash" align="center" label="Previous Hash" width="auto">
          <template v-slot:default="table">
            <nuxt-link v-if="table.row.previousHash !== null" class="nuxt-link"
              :to="{ name: 'nft-detail', query: { hash: table.row.previousHash } }">
              {{ table.row.previousHash | truncate(8) }}
            </nuxt-link>
            <span v-else>no hash</span>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="tid" align="center" label="Transaction ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.tid } }">
              {{ table.row.tid | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 800" prop="ownerAddress" align="center" label="Owner Address" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: table.row.ownerAddress } }">
              {{ table.row.ownerAddress | truncate(6) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="nftMakerId" align="center" label="Nft Maker" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'nft-maker-detail', query: { makerId: table.row.nftMakerId } }">
              {{ table.row.nftMakerId | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :page-size="5"
      layout="prev, pager, next" :total="nftsCount" align="center"></el-pagination>
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
      return 'My Registered NFTs ' + '(total: ' + this.nftsCount + ')';
    },
  },
  data() {
    return {
      loading: true,

      nfts: [],
      nftsCount: 0,

      currentPage: 1,
      pageSize: 5,
    };
  },
  props: {
    ownerAddress: {
      required: true,
      type: String,
    }
  },

  watch: {
    ownerAddress: async function (ownerAddress) {
      console.log(`(Nfts) ownerAddress changed to "${this.ownerAddress}"`);

      // reset
      this.makers = [];
      this.makersCount = 0;

      if (this.ownerAddress === null || this.ownerAddress === undefined || this.ownerAddress === '') {
        console.log(`(Nfts) ownerAddress is "undefined"`);
        return;
      }

      await this.handleCurrentChange(1);
    },
  },

  methods: {
    handleCurrentChange: async function (currentPage) {
      this.loading = true;
      console.log(`(Nfts) load data for page "${currentPage}"`);

      const from = (currentPage - 1) * this.pageSize;

      console.log(`offset: ${from}, limit: ${this.pageSize}, address: ${this.address}`);

      const raw = await connection.api.Nft.getNfts({
        offset: from,
        limit: this.pageSize,
        ownerAddress: this.address,
      });
      this.nfts = raw.nfts;
      this.nftsCount = raw.count;

      console.log(`(Nfts) nfts: ${JSON.stringify(this.nfts, null, 2)}`);

      this.loading = false;
    },

  },
};

</script>