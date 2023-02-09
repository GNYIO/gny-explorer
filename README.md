# gny-explorer


## Configure Endpoint

Create `.env` variable
```bash
touch .env
```

Insert the following values into `.env`
```bash
GNY_ENDPOINT=45.76.215.117
GNY_NETWORK=localnet
GNY_PORT=4096
GNY_HTTPS=false
```

## Build Setup

``` bash
# install dependencies
$ npm ci

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

