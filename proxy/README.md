

# gny-proxy

Why do we need this?


This is a replacement of `netlify` functions. We need to move away from `netlify`, because they have no cost cap. Increased traffic to a website can result in a gigantic bill.


Cloudflare Pages Functions also don't work, because they are only running a **subset** of the `JavaScript` API. And requesting a `raw` IP address like `21.21.21.21` does not work. But we need to query a `raw` ip address to get the information of all peers in the network.


This is a very simple `express` node.js server that queries certain endpoints of the requested peers on the network.

One server can be used both for `testnet` and `mainnet`.


Modern browsers enforce that a website is **all https**. That's why we need this server. Because the browser can't directly query a `http`-only site like: `http://21.21.21.21:4096/api/peers`. It would need a `SSL` certificate and a `domain` name. But most peers have neither. And this small proxy is the alternative to `netlify functions` and `cloudflare functions`.



## Usage by Explorer

This server will be primarily used by the GNY `testnet` and `mainnet` explorers on the **/peers** page


## Example

Let's say that this small server is deployed to `proxy.gny.io`. One request will get all the necessary information about one peer:

```bash
curl 'https://proxy.gny.io/?ip=21.21.21.21&port=4096'

{
    "success": true,
    ...
}

```

