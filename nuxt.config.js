
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
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v2' }
    ]
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
        'Access-Control-Allow-Origin: *'
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
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
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
  }
}
