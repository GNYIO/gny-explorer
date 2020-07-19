# gny-explorer


## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```


# Local Function Development

```bash
npm install --global netlify-cli

# build functions -> functions-build
NODE_ENV=dev netlify functions:build --src=functions --functions=functions-build


# build the vue.js app into -> dist
npm run generate


# serve (the static)
#    dist/
#    functions-build/
netlify dev --dir=dist --functions=functions-build
```

