<template>
  <div>
    <b-card title="NFT
     info" class="shadow">
      <div class="wrapper">
        <div v-if="nft.name !== undefined">
          Name
          <p>{{ nft.name | truncate(18) }} <i class="el-icon-copy-document" @click="copyName"></i></p>
        </div>
        <div v-if="nft.hash !== undefined">
          Hash
          <p>{{ nft.hash | truncate(16) }} <i class="el-icon-copy-document" @click="copyHash"></i></p>
        </div>

        <div v-if="nft.previousHash">
          Previous Hash
          <p>
            <nuxt-link :to="{ name: 'nft-detail', query: { hash: nft.previousHash } }">{{ nft.previousHash.slice(0, 16) }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Previous Hash
          <p>no previous hash</p>
        </div>

        <div v-if="nextHash.hash">
          Next Hash
          <p>
            <nuxt-link :to="{ name: 'nft-detail', query: { hash: nextHash.hash } }">{{ nextHash.hash.slice(0, 16) }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Next Hash
          <p>no next hash</p>
        </div>


        <div>
          NFT Maker
          <p>
            <nuxt-link :to="{ name: 'nft-maker-detail', query: { makerId: nft.nftMakerId } }">{{ nft.nftMakerId }}</nuxt-link>
          </p>
        </div>

        <!-- use v-if otherwise when loading one can see for a split second "undefined" -->
        <div v-if="nft.counter">
          nth NFT from same Maker
          <p><strong>{{ nft.counter | ordinal }}</strong> NFT from <nuxt-link :to="{ name: 'nft-maker-detail', query: { makerId: nft.nftMakerId } }">{{ nft.nftMakerId }}</nuxt-link></p>
        </div>

        <div>
          Owner Address
          <p>
            <nuxt-link :to="{ name: 'account-detail', query: { address: nft.ownerAddress } }">{{ nft.ownerAddress }}</nuxt-link>
          </p>
        </div>

        <div>
          Minting Transaction
          <p>
            <nuxt-link :to="{ name: 'transaction-detail', query: { id: nft.tid } }">{{ nft.tid | truncate(16) }}</nuxt-link>
          </p>
        </div>

        <div>
          NFT URL <span class="grayed_out">(at your own risk)</span>
          <p>{{ nft.url | truncate(24)}}  <i class="el-icon-copy-document" @click="copyNftUrl"></i>
          </p>
        </div>

      </div>
    </b-card>

    <b-card title="NFT Chain" class="shadow mt-4">
      <el-steps simple>

        <el-step v-for="row in rows" :status="typeof row.hash === 'string' ? 'success' : 'wait'" icon="el-icon-upload" v-bind:key="row.counter">
          <div slot="title">

            <span v-if="row.hash && row.current">
              <strong>NFT &#35;{{ row.counter }}</strong>
            </span>

            <nuxt-link v-if="row.hash && !row.current" :to="{ name: 'nft-detail', query: { hash: row.hash } }">NFT &#35;{{ row.counter }}</nuxt-link>
            
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
      console.log(`(nft-detail) name changed`);
      await this.updatePage(name, null);
    },
    '$route.query.hash': async function (hash) {
      console.log(`(nft-detail) hash changed`);
      await this.updatePage(null, hash);
    }
  },

  data() {
    return {
      nft: {},
      nftMaker: {},
      nextHash: {},
      rows: [],
    }
  },

  methods: {
    updatePage: async function (name, hash) {
      console.log(`updatePage (name: ${name}) (hash: ${hash})`);
      // reset all data properties
      this.nft = {};
      this.nftMaker = {};
      this.nextHash = {};
      this.rows = [];

      let nft = null;
      if (hash) {
        const result = await connection.api.Nft.getSingleNft({
          hash,
        });
        if (result.success === true) {
          nft = result.nft;
        }
      }

      if (name) {
        const result = await connection.api.Nft.getSingleNft({
          name,
        });
        if (result.success === true) {
          nft = result.nft;
        }
      }

      if (nft === null) {
        throw new Error('failed to fetch nft');
      }
      this.nft = nft;


      const { maker } = await connection.api.Nft.getSingleNftMaker(nft.nftMakerId);
      if (maker === null) {
        throw new Error('failed to fetch nft maker');
      }
      this.nftMaker = maker;



      // try to get next hash
      console.log(`counter: ${nft.counter}`);
      const nextHashRaw =  await connection.api.Nft.getNfts({
        maker: nft.nftMakerId,
        limit: 1,
        offset: Number(nft.counter),
      });

      if (nextHashRaw.nfts.length === 1) {
        this.nextHash = nextHashRaw.nfts[0];
      }

      



      // add previous nft to rows
      const rows = [];
      if (typeof nft.previousHash === 'string') {
        rows.push({
          hash: nft.previousHash,
          counter: Number(nft.counter) -1,
        });
      }

      // add current nft to rows
      rows.push({
        hash: nft.hash,
        counter: Number(nft.counter),
        current: true,
      });

      // add next or future nft to rows
      if (Object.keys(this.nextHash).length > 0) { // not an empty object
        rows.push({
          hash: this.nextHash.hash,
          counter: Number(this.nextHash.counter),
        });
      } else { // empty object
        rows.push({
          hash: undefined,
          counter: Number(this.nft.counter) + 1,
        });
      }
      
      this.rows = rows;
      console.log(`rows: ${JSON.stringify(rows, null, 2)}`);
    },
    async copyName() {
      try {
        await this.$copyText(this.nft.name);
      } catch (err) {
        console.error(e);
      }
    },
    async copyHash() {
      try {
        await this.$copyText(this.nft.hash);
      } catch (err) {
        console.error(e);
      }
    },
    async copyNftUrl() {
      try {
        await this.$copyText(this.nft.url);
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
