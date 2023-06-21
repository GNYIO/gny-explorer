<template>
  <b-card title="GNY Visualization" class="shadow mt-4">
    <network :nodes="nodes" :edges="edges" :options="options" @double-click="doubleClick">
    </network>
  </b-card>
</template>



<script>
import { getNodesAndEdges } from '../helpers/createNodesAndEdges';


export default {
  data() {
    return {

      nodes: [],
      edges: [],

      options: {
        autoResize: true,
        height: '500px',
        width: '100%',
        edges: {
          labelHighlightBold: false,
          arrows: {
            to: {
              enabled: true,
            }
          },
          shadow: true,
        },
        nodes: {
          shape: 'dot',
          shadow: true,
        },
        interaction: {
          tooltipDelay: 100,
        }
      },

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
      console.log(`(Visualization) address changed to "${address}"`);

      // reset
      this.nodes = [];
      this.edges = [];

      if (this.address === null || this.address === undefined || this.address === '') {
        return;
      }

      await this.handleCurrentChange();
    },
  },
  methods: {
    handleCurrentChange: async function () {
      const { nodes, edges } = await getNodesAndEdges(this.address);

      this.nodes = nodes;
      this.edges = edges;
    },
    doubleClick: async function (el) {
      const firstNode = el.nodes[0];

      if (typeof firstNode === 'string') {
        console.log(`now navigating to account "${firstNode}"`);
        this.$router.push({name: 'account-detail', query: { address: firstNode }});
      }
    },
  }
};

</script>