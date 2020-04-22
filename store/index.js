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
  appendBlocks(state, blocks) {
    blocks.forEach(block => {
      state.blocks.push(block);
    });
  }
}

export const actions = {
  setTransactions({ commit }, transactions) {
    commit('setTransactions', transactions);
  },
  setBlocks({ commit }, blocks) {
    commit('setBlocks', blocks);
  },
  appendBlocks({ commit }, blocks) {
    commit('appendBlocks', blocks);
  },
}
