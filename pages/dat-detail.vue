<template>
  <div>
    <b-card :title="custom_title" class="shadow">
      <div class="wrapper">
        <div v-if="dat.name !== undefined">
          DAT Name
          <p>{{ dat.name | truncate(18) }} <i class="el-icon-copy-document" @click="copyName"></i></p>
        </div>
        <div v-if="dat.hash !== undefined">
          Hash
          <p>{{ dat.hash | truncate(16) }} <i class="el-icon-copy-document" @click="copyHash"></i></p>
        </div>

        <div v-if="dat.previousHash">
          Previous Hash in chain
          <p>
            <nuxt-link :to="{ name: 'dat-detail', query: { hash: dat.previousHash } }">{{ dat.previousHash.slice(0, 16) }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Previous Hash in chain
          <p>no previous hash</p>
        </div>

        <div v-if="nextHash.hash">
          Next Hash in chain
          <p>
            <nuxt-link :to="{ name: 'dat-detail', query: { hash: nextHash.hash } }">{{ nextHash.hash.slice(0, 16) }}</nuxt-link>
          </p>
        </div>
        <div v-else>
          Next Hash in chain
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
          Chronological order position
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
          Time Minted
          <p>{{ dat.timestamp | timestamp2datefilter }}</p>
        </div>

        <div>
          DAT URL <span class="grayed_out">(at your own risk)</span>
          <p>{{ dat.url | truncate(24)}}  <i class="el-icon-copy-document" @click="copyDatUrl"></i>
          </p>
        </div>

        <div>
          <el-tooltip v-if="showError === false && showSuccess === false" effect="dark" placement="bottom">
            <div slot="content">Click to verify this DAT.<br/> Use at your own risk!</div>

            <!-- setting the "border-width" to "0px" fixes a bug where the border of the button overflows the el-loading-mask css class -->
            <el-button style="font-size: 53px; border-width: 0px;" @click="verify" type="warning" icon="el-icon-question" circle v-loading="buttonLoading"></el-button>
          </el-tooltip>

          <el-tooltip v-if="showError" effect="dark" placement="bottom">
            <div slot="content">{{ errorText }}</div>
            <el-button style="font-size: 53px;" v-if="showError === true" type="danger" icon="el-icon-close" circle></el-button>
          </el-tooltip>

          <el-tooltip v-if="showSuccess" effect="dark" placement="bottom">
            <div slot="content">{{ successText }}</div>

            <el-button style="font-size: 53px;" v-if="showSuccess === true" type="success" icon="el-icon-check" circle></el-button>
          </el-tooltip>
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
import * as gnyClient from '@gnyio/client';
import axios from 'axios';
import * as webEd from '@gnyio/web-ed';

const connection = new gnyClient.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);

export default {
  computed: {
    ...mapGetters(['width']),
    custom_title: {
      get: function() {
        if (typeof this.dat.name === 'string') {
          const last = this.dat.name.split('.')[1];

          if (last.length > 20) {
            const lastShort = last.slice(0, 20) + '...';
            return `DAT ${lastShort}`;
          } else {
            return `DAT ${last}`
          }

        } else {
          return 'DAT Info';
        }
      },
    }
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
      showError: false,
      errorText: '',

      showSuccess: false,
      successText: '',
      buttonLoading: false,

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

    async verify() {
      this.buttonLoading = true;

      console.log('verifing DAT...');

      let result = null;
      try {
        console.log(`url: ${this.dat.url}`);

        result = await axios.request({
          method: 'GET',
          url: this.dat.url,
          maxRedirects: 0, // do not redirect
          // responseType: 'json',
          crossDomain: true,
          timeout: 5000,
        });
        console.log('finished request');
      } catch (err) {

        // error happens if domain does not exist or file can't be found
        console.log('error during fetching json data (dat-detail)');
        console.log(err);

        this.showError = true;
        this.errorText = 'File not found!';

        // todo: show Notification popup
        return;
      }

      console.log('after try block');


      // validate structure of data
      const validationResult = gnyClient.schemas.datSchema.validate(result.data);
      if (!validationResult.result) {
        this.showError = true;
        this.errorText = 'Data is not in correct format';
        return;
      }

      if (result.data.hash) { // is DATsha256
        const data = result.data.data;
        const hash = result.data.hash;

        const ownHash = webEd.createSha256Hash(data);
        if (hash !== ownHash) {
          this.showError = true;
          this.errorText = 'Data does not match the provided Hash!';
        } else {
          this.showSuccess = true;
          this.successText = 'Hashes are matching! Data has not changed.';
        }
      } else { // is DATEd25519
        const data = result.data.data;
        const publicKey = result.data.publicKey;
        const signature = result.data.signature;
        try {
          const result = gnyClient.verification.MessageWebBase.verify(
            data,
            signature,
            publicKey
          );
          if (result) {
            ths.showSuccess = true;
            this.successText = 'Signature is correct. Data wasn\'t tampered with';
          } else {
            this.showError = true;
            this.showError = 'ed25519 signature does not match';
          }
        } catch (err) {
          this.showError = true;
          this.showError = 'ed25519 not in correct format';
          return;
        }
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
