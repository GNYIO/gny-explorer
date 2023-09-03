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
          Transaction Id
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
    },
  },

  data() {
    return {
      maker: {},
    }
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
  },

  async mounted() {
    console.log('mounted');

    console.log(`(nft-maker-detail) mounted()`);
    const makerId = this.$route.query.makerId;

    await this.updatePage(makerId);
  }
};

</script>
