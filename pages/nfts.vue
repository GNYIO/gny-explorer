<template>
  <div>
    <b-card title="NFTs Overview" class="shadow">
      <div class="wrapper">
        <div>
          NFTs
          <p>{{ totalNfts }}</p>
        </div>
        <div>
          NFT Makers
          <p>{{ totalNftMakers }}</p>
        </div>
      </div>
    </b-card>

    <b-card title="All NFTs" class="shadow">
      <el-table :data="nfts" stripe height="300" v-loading="loading">
        <el-table-column v-if="width >= 550" prop="name" align="center" label="Nft Name" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'nft-detail', query: { name: table.row.name } }">
              {{ table.row.name | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="hash" align="center" label="Nft Hash" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'nft-detail', query: { hash: table.row.hash } }">
              {{ table.row.hash | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="previousHash" align="center" label="Previous Hash" width="auto">
          <template v-slot:default="table">
            <nuxt-link v-if="table.row.previousHash !== null" class="nuxt-link"
              :to="{ name: 'nft-detail', query: { hash: table.row.previousHash } }">
              {{ table.row.previousHash | truncate(8) }}
            </nuxt-link>
            <span v-else>no hash</span>
          </template>
        </el-table-column>
        <el-table-column prop="tid" align="center" label="Transaction ID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.tid } }">
              {{ table.row.tid | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column prop="ownerAddress" align="center" label="Owner Address" width="auto">
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
      <el-pagination @current-change="handleCurrentChange" :current-page="currentNftPage" :page-size="5"
        layout="prev, pager, next" :total="nftsCount" align="center"></el-pagination>
    </b-card>

    <b-card title="All NFT Makers" class="shadow">

    </b-card>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as gnyClient from '@gny/client'

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    ...mapGetters(['width'])
  },
  data() {
    return {
      totalNfts: 0,
      totalNftMakers: 0,

      nfts: [],
      nftsCount: 0,
      currentNftPage: 1,
      nftPageSize: 5,
      loading: true
    }
  },
  methods: {
    async handleCurrentChange(currentNftPage) {
      this.loading = true;
      console.log(`(Nfts) load data for page "${currentNftPage}"`);

      const from = (currentNftPage - 1) * this.nftPageSize;
      const offset = from;
      const limit = this.nftPageSize;

      const { nfts, count } = await connection.api.Nft.getNfts(offset, limit);
      this.nfts = nfts;
      this.nftsCount = count;

      console.log(JSON.stringify(nfts, null, 2));

      this.loading = false;
    },
  },

  async mounted() {
    const totalNfts = await connection.api.Nft.getNfts();
    const totalNftMakers = await connection.api.Nft.getNftMakers();
    this.totalNfts = totalNfts.count;
    this.totalNftMakers = totalNftMakers.count;


    // reset
    this.nfts = [];
    this.nftsCount = 0;

    await this.handleCurrentChange(1);
  }
}
</script>

<style scoped>
.card {
  margin-bottom: 2rem;
}

.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

@media screen and (min-width: 300px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 500px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media screen and (min-width: 800px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}
</style>