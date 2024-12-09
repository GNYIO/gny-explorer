

# gny-explorer-proxy

Why do we need this?


This is a replacement of `netlify` functions. We need to move away from `netlify`, because they have no cost cap. Increased traffic to a website can result in a gigantic bill.


Cloudflare Pages Functions also don't work, because they are only running a **subset** of the `JavaScript` API. And requesting a `raw` IP address like `21.21.21.21` does not work. But we need to query a `raw` ip address to get the information of all peers in the network.


This `proxy` is a very simple `express` node.js server that queries certain endpoints of the requested peers on the network.

One server can be used both for `testnet` and `mainnet`.


Modern browsers enforce that a website is **all https**. That's why we need this server. Because the browser can't directly query a `http`-only site like: `http://21.21.21.21:4096/api/peers`. It would need a `SSL` certificate and a `domain` name. But most peers have neither. And this small proxy is the alternative to `netlify functions` and `cloudflare functions`.



## Usage by Explorer

This server will be primarily used by the GNY `testnet` and `mainnet` explorers on the **/peers** page


## Example

Let's say that this small server is deployed to `proxy.explorer.gny.io`. One request will get all the necessary information about one peer:

```bash
curl 'https://proxy.explorer.gny.io/?ip=21.21.21.21&port=4096'

{
    "success": true,
    ...
}

```


## TODO

Currently the proxy does not restrict users to pass in localhost ip addresses: `?ip=127.0.0.1`. This could be used to enumerate the locally running services.



## Installation


This tool needs to be deployed for `testnet` **and** `mainnet`.

First create a new user `gny-explorer-proxy`. This is a linux user of type `system`, that has no login shell and no home directory.

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin gny-explorer-proxy

```


We will use [n](https://github.com/tj/n) to install `node.js`.


The program **n** installs `node.js` globally under `/usr/local/bin/node`. This is sometimes better than install `node.js` with the `nvm` tool, because `nvm` itstalls it only under the current user, which makes it harder to use with `systemd` services.


```bash
cd /opt


git clone https://github.com/tj/n
cd n

# install n global
make install

# install node.js v16 with n
n install v16

# get path of node
which node
/usr/local/bin/node

```



Clone `https://github.com/GNYIO/gny-explorer` into `/opt/`. Or manually first download the `.tar` archive from Github and then upload it with `scp` to the server:
```bash
cd /opt

git clone https://github.com/GNYIO/gny-explorer

```


First change into the `proxy/` directory. Install all dependencies listed in `package.json`:

```bash
cd /opt/gny-explorer/proxy/
npm ci

```


Copy the `systemd` service file in this repository to `/etc/systemd/system/`.

Make sure that the `systemd` service notices the new file:
```bash
cp /opt/gny-explorer/proxy/gny-explorer-proxy.service /etc/systemd/system/

# then reload systemd
sudo systemctl daemon-reload

```

Enable and start the service.


<br>
<br>
