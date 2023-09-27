<template>
  <div>
    <b-card title="Maker info" class="shadow">
      <div class="wrapper">
        <div>
          Name
          <p>{{ maker.name }}</p>
        </div>
        <div>
          Description
          <p>{{ maker.desc }}</p>
        </div>
        <div>
          Address
          <p>
            <nuxt-link :to="{ name: 'account-detail', query: { address: maker.address } }">{{
            maker.address | truncate(12) }}</nuxt-link>
          </p>            
        </div>
        <div>
          Registration Transaction
          <p>
            <nuxt-link :to="{ name: 'transaction-detail', query: { tid: maker.tid } }">{{
            maker.tid | truncate(12) }}</nuxt-link>          
          </p>
        </div>
        <div>
          NFTs created
          <p>{{ maker.nftCounter }}</p>
        </div>
      </div>
    </b-card>

    <br/>

    <b-card title="My NFTs" class="shadow">
      <el-table :data="nfts" stripe height="300" v-loading="loading">
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
      </el-table>
      <el-pagination @current-change="handleCurrentNftChange" :current-page="currentNftPage" :page-size="nftPageSize"
        layout="prev, pager, next" :total="nftsCount" align="center"></el-pagination>
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

export default {
  computed: {
    ...mapGetters(['width']),
  },
  watch: {
    '$route.query.makerId': async function (makerId) {
      console.log(`(nft-maker-detail) makerId changed`);
      await this.updatePage(makerId);
      await this.handleCurrentNftChange(1);
    },
  },

  data() {
    return {
      maker: {},

      loading: true,
      
      nfts: [],
      nftsCount: 0,
      currentNftPage: 1,
      nftPageSize: 5,
    };
  },

  methods: {
    updatePage: async function (name) {
      console.log(`nft-maker-detail (name: ${name})`);
      // reset all data properties
      this.maker = {}

      let maker = null;
      if (name) {
        const result = await connection.api.Nft.getSingleNftMaker(name);
        console.log(JSON.stringify(result, null, 2));

        if (result.success === true) {
          maker = result.maker;
        }
      }

      if (maker === null) {
        throw new Error('failed to fetch maker');
      }

      console.log(JSON.stringify(maker, null, 2));
      this.maker = maker;
    },

    async handleCurrentNftChange(currentNftPage) {
      this.loading = true;
      console.log(`(Nfts) load data for page "${currentNftPage}"`);

      const from = (currentNftPage - 1) * this.nftPageSize;
      const offset = from;
      const limit = this.nftPageSize;

      const { nfts, count } = await connection.api.Nft.getNfts({
        offset,
        limit,
        maker: this.maker.name,
      });
      this.nfts = nfts;
      this.nftsCount = count;

      this.loading = false;
    },
  },

  async mounted() {
    console.log('mounted');

    console.log(`(nft-maker-detail) mounted()`);
    const makerId = this.$route.query.makerId;

    await this.updatePage(makerId);
    await this.handleCurrentNftChange(1);
  }
};

</script>


<style scoped>
.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

/* changed from 300px to 650 */
@media screen and (min-width: 650px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

/* removed one media query */

@media screen and (min-width: 800px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

</style>

