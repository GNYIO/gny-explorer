import axios from 'axios';



const ip = process.env['GNY_ENDPOINT'];
const port = Number(process.env['GNY_PORT']);
const network = process.env['GNY_NETWORK'];


export async function getNode(ip, port, network)  {
    const url = `.netlify/functions/serverless-http?ip=${ip}&port=${port}&networkType=${network}`;
    const request = await axios.get(url);

    return request.data;
}

export async function getRoot() {
    return await getNode(ip, port, network);
}


export async function getAllPeers() {

    const result = {
        visNodes: [],
        visEdges: [],
        peersList: [],
    };

    const root = await getRoot();
    console.log(`root: ${JSON.stringify(root, null, 2)}`);

    return result;
}