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

export async function getRoot() {
    const root = await getNode(ip, port, network);

    if (root.success) {
        result.visNodes.push({
            id: root.peersInfo.publicIp,
            name: root.peersInfo.publicIp,
            _color: '#67a8af',
            label: root.peersInfo.publicIp,
        });

        for (let i = 0; i < root.peers.length; ++i) {
            // result.visNodes({
            //     id: 
            // })
        }
    }
}


export async function getAllPeers() {
    await getRoot();

    return result;
}
