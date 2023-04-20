
module.exports = {
  mode: 'spa',
  env: {
   GNY_ENDPOINT: process.env.GNY_ENDPOINT,
   GNY_PORT: process.env.GNY_PORT,
   GNY_NETWORK: process.env.GNY_NETWORK,
   GNY_HTTPS: process.env.GNY_HTTPS,
  },
  /*
  ** Headers of the page
  */
  head() {
    const capitalize = (word) => {
      if (typeof word === 'string' && word.length >= 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return '';
    };
    return {
      title: `GNY ${capitalize(process.env.GNY_NETWORK)} Explorer`,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v2' }
      ]
    }
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/element-ui',
    { src: '~/plugins/infinite-loading', ssr: false },
    '@/plugins/vue-vis-network',
  ],
  /*element-theme-chalk
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  netlify: { 
    mergeSecurityHeaders: true,
    headers: {
      '/*': [
        'Access-Control-Allow-Origin: *',
        'X-Frame-Options: DENY'
      ]
    }
  },

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    'nuxt-clipboard2',
    '@aceforth/nuxt-netlify',
    'bootstrap-vue/nuxt',
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: '/'
  },
  /*
  ** Build configuration
  */
  build: {
    transpile: [/^element-ui/],
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  telemetry: false,
}
