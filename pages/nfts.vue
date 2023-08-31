<template>
  <b-card title="Nfts" class="shadow">
    <el-table :data="currentNfts" stripe height="500" v-loading="loading">
      
      <el-table-column
        v-if="width >= 550"
        prop="name"
        align="center"
        label="Name"
        width="auto">
      <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'nft-detail', query: { name: table.row.name } }">
            {{ table.row.name }}
          </nuxt-link>
        </template>
    </el-table-column>

      <el-table-column
        prop="hash"
        align="center"
        label="Hash"
        width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'nft-detail', query: { hash: table.row.hash } }">
            {{ table.row.hash.slice(0, 16) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column
        prop="previousHash"
        align="center"
        label="Previous Hash"
        width="auto">
        <template v-slot:default="table">
          <nuxt-link v-if="table.row.previousHash !== null" class="nuxt-link" :to="{ name: 'nft-detail', query: { hash: table.row.previousHash } }">
            {{ table.row.previousHash }}
          </nuxt-link>
          <span v-else>no hash</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="tid"
        align="center"
        label="Transaction ID"
        width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.tid } }">
            {{ table.row.tid.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column
        prop="ownerAddress"
        align="center"
        label="Owner Address"
        width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: table.row.ownerAddress } }">
            {{ table.row.ownerAddress.slice(0, 8) }}
          </nuxt-link>
        </template>
      </el-table-column>

      <el-table-column
        prop="nftMakerId"
        align="center"
        label="Nft Maker"
        width="auto">
        <template v-slot:default="table">
          <nuxt-link class="nuxt-link" :to="{ name: 'nft-maker-detail', query: { makerId: table.row.nftMakerId } }">
            {{ table.row.nftMakerId }}
          </nuxt-link>
        </template>
      </el-table-column>


    </el-table>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="10"
      layout="prev, pager, next"
      :total="nftsCount"
      align="center"
    ></el-pagination>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
// import * as gnyClient from '@gny/client'
import { slots } from '@gny/utils';
import axios from 'axios';

export default {
  computed: {
    ...mapGetters(['width'])
  },
  data() {
    return {
      nfts: [],
      nftsCount: 0,
      currentNfts: [],
      currentPage: 1,
      pageSize: 10,
      loaded: 0,
      loading: true
    }
  },
  methods: {
    subTransactionId: function(row, column) {
      return row.tid.slice(0, 8)
    },

    subIssuerId: function(issuerId) {
      return issuerId.slice(0, 8)
    },

    timestamp2date: function(row, column) {
      return moment.utc(slots.getRealTime(row.timestamp)).format(
        'YYYY-MM-DD HH:mm:ss UTC'
      )
    },

    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.changePage(this.nfts, currentPage)
    },

    changePage(list, currentPage) {
      let from = (currentPage - 1) * this.pageSize
      let to = currentPage * this.pageSize
      this.currentNfts = []
      for (; from < to; from++) {
        if (list[from]) {
          this.currentNfts.push(list[from])
        }
      }
    }
  },

  // "hash": "2c2624a5059934a947d6e25fe8332ade",
  //   "previousHash": null,
  //   "tid": "0bc5492ea8e7d1df038ff7d66c98386fc31b5193e62d9aa60b20c443e24a1ed6",
  //   "counter": "1",
  //   "nftMakerId": "one",
  //   "ownerAddress": "G2ofFMDz8GtWq9n65khKit83bWkQr",

  async mounted() {
    const { data } = await axios.get('http://127.0.0.1:15096/api/nft');
    const result = data.nfts;

    this.nfts = result;
    console.log(JSON.stringify(result, null, 2));

    this.nftsCount = this.nfts.length
    this.handleCurrentChange(1);

    if (this.nfts.length >= 0) {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.card {
  margin-bottom: 2rem; 
}
</style>