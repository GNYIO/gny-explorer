import Vue from 'vue';


const state = Vue.observable({
  width: window.innerWidth,
});


window.addEventListener('resize', () => {
  state.width = window.innerWidth;
});

export const getters = {
  width: () => state.width,
};

