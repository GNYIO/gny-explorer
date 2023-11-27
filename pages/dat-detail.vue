<template>
  <div>
    <b-card title="DAT
     info" class="shadow">
      <div class="wrapper">
        <div v-if="dat.name !== undefined">
          Name
          <p>{{ dat.name | truncate(18) }} <i class="el-icon-copy-document" @click="copyName"></i></p>
        </div>
        <div v-if="dat.hash !== undefined">
          Hash
          <p>{{ dat.hash | truncate(16) }} <i class="el-icon-copy-document" @click="copyHash"></i></p>
        </div>

        <div v-if="dat.previousHash">
          Previous Hash
          <p>
            <nuxt-link :to="{ name: 'dat-detail', query: { hash: dat.previousHash } }">{{ dat.previousHash.slice(0, 16) }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Previous Hash
          <p>no previous hash</p>
        </div>

        <div v-if="nextHash.hash">
          Next Hash
          <p>
            <nuxt-link :to="{ name: 'dat-detail', query: { hash: nextHash.hash } }">{{ nextHash.hash.slice(0, 16) }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Next Hash
          <p>no next hash</p>
        </div>


        <div>
          DAT Maker
          <p>
            <nuxt-link :to="{ name: 'dat-maker-detail', query: { makerId: dat.datMakerId } }">{{ dat.datMakerId }}</nuxt-link>
          </p>
        </div>

        <!-- use v-if otherwise when loading one can see for a split second "undefined" -->
        <div v-if="dat.counter">
          nth DAT from same Maker
          <p><strong>{{ dat.counter | ordinal }}</strong> DAT from <nuxt-link :to="{ name: 'dat-maker-detail', query: { makerId: dat.datMakerId } }">{{ dat.datMakerId }}</nuxt-link></p>
        </div>

        <div>
          Owner Address
          <p>
            <nuxt-link :to="{ name: 'account-detail', query: { address: dat.ownerAddress } }">{{ dat.ownerAddress }}</nuxt-link>
          </p>
        </div>

        <div>
          Minting Transaction
          <p>
            <nuxt-link :to="{ name: 'transaction-detail', query: { id: dat.tid } }">{{ dat.tid | truncate(16) }}</nuxt-link>
          </p>
        </div>

        <div>
          DAT URL <span class="grayed_out">(at your own risk)</span>
          <p>{{ dat.url | truncate(24)}}  <i class="el-icon-copy-document" @click="copyDatUrl"></i>
          </p>
        </div>

      </div>
    </b-card>

    <b-card title="DAT Chain" class="shadow mt-4">
      <el-steps simple>

        <el-step v-for="row in rows" :status="typeof row.hash === 'string' ? 'success' : 'wait'" icon="el-icon-upload" v-bind:key="row.counter">
          <div slot="title">

            <span v-if="row.hash && row.current">
              <strong>DAT &#35;{{ row.counter }}</strong>
            </span>

            <nuxt-link v-if="row.hash && !row.current" :to="{ name: 'dat-detail', query: { hash: row.hash } }">DAT &#35;{{ row.counter }}</nuxt-link>
            
            <span v-if="!row.hash">not minted yet</span>

          </div>
        </el-step>
        
      </el-steps>
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
    '$route.query.name': async function (name) {
      console.log(`(dat-detail) name changed`);
      await this.updatePage(name, null);
    },
    '$route.query.hash': async function (hash) {
      console.log(`(dat-detail) hash changed`);
      await this.updatePage(null, hash);
    }
  },

  data() {
    return {
      dat: {},
      datMaker: {},
      nextHash: {},
      rows: [],
    }
  },

  methods: {
    updatePage: async function (name, hash) {
      console.log(`updatePage (name: ${name}) (hash: ${hash})`);
      // reset all data properties
      this.dat = {};
      this.datMaker = {};
      this.nextHash = {};
      this.rows = [];

      let dat = null;
      if (hash) {
        const result = await connection.api.Dat.getSingleDat({
          hash,
        });
        if (result.success === true) {
          dat = result.dat;
        }
      }

      if (name) {
        const result = await connection.api.Dat.getSingleDat({
          name,
        });
        if (result.success === true) {
          dat = result.dat;
        }
      }

      if (dat === null) {
        throw new Error('failed to fetch dat');
      }
      this.dat = dat;


      const { maker } = await connection.api.Dat.getSingleDatMaker(dat.datMakerId);
      if (maker === null) {
        throw new Error('failed to fetch dat maker');
      }
      this.datMaker = maker;



      // try to get next hash
      console.log(`counter: ${dat.counter}`);
      const nextHashRaw =  await connection.api.Dat.getDats({
        maker: dat.datMakerId,
        limit: 1,
        offset: Number(dat.counter),
      });

      if (nextHashRaw.dats.length === 1) {
        this.nextHash = nextHashRaw.dats[0];
      }

      



      // add previous dat to rows
      const rows = [];
      if (typeof dat.previousHash === 'string') {
        rows.push({
          hash: dat.previousHash,
          counter: Number(dat.counter) -1,
        });
      }

      // add current dat to rows
      rows.push({
        hash: dat.hash,
        counter: Number(dat.counter),
        current: true,
      });

      // add next or future dat to rows
      if (Object.keys(this.nextHash).length > 0) { // not an empty object
        rows.push({
          hash: this.nextHash.hash,
          counter: Number(this.nextHash.counter),
        });
      } else { // empty object
        rows.push({
          hash: undefined,
          counter: Number(this.dat.counter) + 1,
        });
      }
      
      this.rows = rows;
      console.log(`rows: ${JSON.stringify(rows, null, 2)}`);
    },
    async copyName() {
      try {
        await this.$copyText(this.dat.name);
      } catch (err) {
        console.error(e);
      }
    },
    async copyHash() {
      try {
        await this.$copyText(this.dat.hash);
      } catch (err) {
        console.error(e);
      }
    },
    async copyDatUrl() {
      try {
        await this.$copyText(this.dat.url);
      } catch (e) {
        console.error(e);
      }
    },
  },

  async mounted() {
    console.log(`(account-detail) mounted()`);
    const name = this.$route.query.name;
    const hash = this.$route.query.hash;

    await this.updatePage(name, hash);
  }
};

</script>

<style scoped>
i {
    cursor: pointer;
}

.wrapper {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
}

/* changed */
@media screen and (min-width: 700px) {
  .wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

/* changed */
@media screen and (min-width: 1000px) {
  .wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

p {
  color: #acacac;
}

.nuxt-link {
  color: #2475ba;
  cursor: pointer;
}

.el-icon-copy-document {
  transition: 0.1s;
  transition-property: color;
}

.el-icon-copy-document:hover {
  color: #565656;
}

.el-icon-copy-document:active {
  color: black;
}

.grayed_out {
  color: #acacac;
  font-size: 12px;
  font-weight: 300;
}
</style>
