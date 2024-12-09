# gny-explorer


## Configure Endpoint

Create `.env` variable
```bash
touch .env
```

Insert the following values into `.env`
```bash
GNY_ENDPOINT=testnet.gny.io
GNY_NETWORK=testnet
GNY_PORT=4096
GNY_HTTPS=true
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



# /peers

The **/peers** tab calls the proxy server in the `proxy/` directory. Before we used `netlify functions`. We no longer use `netlify`, because they have no cost cap.
