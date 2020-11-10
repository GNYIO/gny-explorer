
const ip = process.env['GNY_ENDPOINT'];
const port = Number(process.env['GNY_PORT']);
const network = process.env['GNY_NETWORK'];
const https = JSON.parse(process.env['GNY_HTTPS'] || false);

const result = {
    visNodes: [],
    visEdges: [],
    peersList: [],
};

export async function getNode(axios, ip, port, network) {
    const url = `.netlify/functions/serverless-http?ip=${ip}&port=${port}&networkType=${network}&https=${https}`;
    console.log(`getNode() url: ${url}`);
    const request = await axios.get(url);

    return request.data;
}

// { public: { publicIp: ''}}
function isNodeAlreadyHere(node) {
    const available = result.visNodes.find(x => x.id === node.peersInfo.publicIp);
    if (available) {
        return true;
    } else {
        return false;
    }
}
// { simple: { host: '' }}
function isChildNodeAlreadyHere(node) {
    const available = result.visNodes.find(x => x.id === node.simple.host);
    if (available) {
        return true;
    } else {
        return false;
    }
}


function isEdgeAlreadyHere(edge) {
    const available = result.visEdges.find(x => x.id === edge.id);
    if (available) {
        return true;
    } else {
        return false;
    }
}

function isAlreadyInPeersList(node) {
    const one = result.peersList.find(x => x.peersInfo.publicIp === node.peersInfo.publicIp);
    if (one === undefined) {
        false;
    } else {
        return true;
    }
}

function stripInfo(node) {
    if (node.success) {

        if (!isAlreadyInPeersList(node)) {
            // make the peersList
            result.peersList.push(node);
        }

        if (!isNodeAlreadyHere(node)) {
            result.visNodes.push({
                id: node.peersInfo.publicIp,
                color: '#67a8af',
                label: node.peersInfo.publicIp,
            });
        }

        for (let i = 0; i < node.peers.length; ++i) {
            const one = node.peers[i];

            if (!isChildNodeAlreadyHere(one)) {
                result.visNodes.push({
                    id: one.simple.host,
                    color: '#67a8af',
                    label: one.simple.host,
                });
            }

            const edgeId = `${node.peersInfo.publicIp}-${one.simple.host}`;

            if (!isEdgeAlreadyHere({ id: edgeId })) {
                result.visEdges.push({
                    id: edgeId,
                    from: node.peersInfo.publicIp,
                    to: one.simple.host,
                });
            }
        }

    }
}

export async function getRoot(axios) {
    const root = await getNode(axios, ip, port, network, https);
    stripInfo(root);

    for (let i = 0; i < root.peers.length; ++i) {
        const one = root.peers[i];
        const request = await getNode(axios, one.simple.host, Number(one.simple.port) -1, network, false);
        stripInfo(request);
    }
}

function changeNodeColor(ip, color) {
    const node = result.visNodes.find(x => x.id === ip);
    if (node) {
        node.color = color;
    }
}


export async function getAllPeers(axios) {
    await getRoot(axios);

    changeNodeColor(ip, 'lawngreen');

    return result;
}
