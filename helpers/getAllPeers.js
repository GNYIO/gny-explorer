import axios from 'axios';

const ip = process.env['GNY_ENDPOINT'];
const port = Number(process.env['GNY_PORT']);
const network = process.env['GNY_NETWORK'];

const result = {
    visNodes: [],
    visEdges: [],
    peersList: [],
};

export async function getNode(ip, port, network)  {
    const url = `.netlify/functions/serverless-http?ip=${ip}&port=${port}&networkType=${network}`;
    console.log(`url: ${url}`);
    const request = await axios.get(url);

    return request.data;
}

function isNodeAlreadyHere(node) {
    const available = result.visNodes.filter(x => x.id === node.peersInfo.publicIp);
    if (available == null) {
        return true;
    } else {
        return false;
    }
}

function isEdgeAlreadyHere(edgeId) {
    // debug;
    const available = result.visEdges.filter(x => x.id === edgeId);
    if (available == null) {
        return true;
    } else {
        return false;
    }
}

function stripInfo(node) {
    if (node.success) {
        console.log('works');
        result.visNodes.push({
            id: node.peersInfo.publicIp,
            _color: '#67a8af',
            label: node.peersInfo.publicIp,
        });

        for (let i = 0; i < node.peers.length; ++i) {
            const one = node.peers[i];
            console.log('node ' + i);

            console.log('works(child-node) ' + i);

            result.visNodes.push({
                id: one.simple.host,
                _color: '#67a8af',
                label: one.simple.host,
            });

            const edgeId = `${node.peersInfo.publicIp}-${one.simple.host}`;
            console.log('works(child-edge) ' + i);

            result.visEdges.push({
                id: edgeId,
                from: node.peersInfo.publicIp,
                to: one.simple.host,
                _color: '#acacac',
            });
        }

    }
}

export async function getRoot() {
    const root = await getNode(ip, port, network);
    stripInfo(root);
}


export async function getAllPeers() {
    await getRoot();

    return result;
}
