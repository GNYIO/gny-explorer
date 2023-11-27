<template>
  <div>
    <b-card title="DATs Overview" class="shadow">
      <div class="wrapper">
        <div>
          DATs
          <p>{{ totalDats }}</p>
        </div>
        <div>
          DAT Makers
          <p>{{ totalDatMakers }}</p>
        </div>
      </div>
    </b-card>

    <b-card title="All DATs" class="shadow">
      <el-table :data="dats" stripe height="300" v-loading="loading">
        <el-table-column prop="name" align="center" label="Dat Name" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'dat-detail', query: { name: table.row.name } }">
              {{ table.row.name | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 600" prop="hash" align="center" label="Dat Hash" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'dat-detail', query: { hash: table.row.hash } }">
              {{ table.row.hash | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
        <el-table-column v-if="width >= 600" prop="previousHash" align="center" label="Previous Hash" width="auto">
          <template v-slot:default="table">
            <nuxt-link v-if="table.row.previousHash !== null" class="nuxt-link"
              :to="{ name: 'dat-detail', query: { hash: table.row.previousHash } }">
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
        <el-table-column prop="datMakerId" align="center" label="Dat Maker" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'dat-maker-detail', query: { makerId: table.row.datMakerId } }">
              {{ table.row.datMakerId | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @current-change="handleCurrentDatChange" :current-page="currentDatPage" :page-size="datPageSize"
        layout="prev, pager, next" :total="datsCount" align="center"></el-pagination>
    </b-card>


    <b-card title="All DAT Makers" class="shadow">
      <el-table :data="makers" stripe height="300" v-loading="loading">
        <el-table-column prop="name" align="center" label="Maker Name" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'dat-maker-detail', query: { makerId: table.row.name } }">
              {{ table.row.name | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 400" prop="desc" align="center" label="Description">
          <template v-slot:default="table">
            {{  table.row.desc | truncate(8) }}
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 800" prop="datCounter" align="center" label="# of DATs">
        </el-table-column>

        <el-table-column v-if="width >= 800"  prop="address" label="Address" align="center">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'account-detail', query: { address: table.row.address } }">
              {{ table.row.address | truncate(6) }}
            </nuxt-link>
          </template>
        </el-table-column>

        <el-table-column v-if="width >= 800" prop="tid" align="center" label="TID" width="auto">
          <template v-slot:default="table">
            <nuxt-link class="nuxt-link" :to="{ name: 'transaction-detail', query: { id: table.row.tid } }">
              {{ table.row.tid | truncate(8) }}
            </nuxt-link>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination @current-change="handleCurrentMakerChange" :current-page="currentMakersPage" :page-size="makerPageSize"
        layout="prev, pager, next" :total="makersCount" align="center"></el-pagination>
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
      totalDats: 0,
      totalDatMakers: 0,

      dats: [],
      datsCount: 0,
      currentDatPage: 1,
      datPageSize: 5,

      makers: [],
      makersCount: 0,
      currentMakersPage: 1,
      makerPageSize: 5,

      loading: true
    }
  },
  methods: {
    async handleCurrentDatChange(currentDatPage) {
      this.loading = true;
      console.log(`(Dats) load data for page "${currentDatPage}"`);

      const from = (currentDatPage - 1) * this.datPageSize;
      const offset = from;
      const limit = this.datPageSize;

      const { dats, count } = await connection.api.Dat.getDats({ offset, limit });
      this.dats = dats;
      this.datsCount = count;

      console.log(JSON.stringify(dats, null, 2));

      this.loading = false;
    },

    async handleCurrentMakerChange(currentMakersPage) {
      this.loading = true;
      console.log(`(Dats) load maker data for page "${currentMakersPage}"`);

      const from = (currentMakersPage - 1) * this.makerPageSize;
      const offset = from;
      const limit = this.makerPageSize;

      const { makers, count } = await connection.api.Dat.getDatMakers(offset, limit);
      this.makers = makers;
      this.makersCount = count;

      console.log(JSON.stringify(makers, null, 2));

      this.loading = false;
    },

  },

  async mounted() {
    const totalDats = await connection.api.Dat.getDats();
    const totalDatMakers = await connection.api.Dat.getDatMakers();
    this.totalDats = totalDats.count;
    this.totalDatMakers = totalDatMakers.count;


    // reset
    this.dats = [];
    this.datsCount = 0;
    this.makers = [];
    this.makersCount = 0;


    await this.handleCurrentDatChange(1);
    await this.handleCurrentMakerChange(1);
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