export const state = () => ({
  blocks: [],
  transactions: [],

})
  
export const mutations = {
  setTransactions(state, transactions) {
    state.transactions = transactions;
  },
  setBlocks(state, blocks) {
    state.blocks = blocks;
  },
}