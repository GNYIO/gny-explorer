import ky from 'ky';


export async function onRequestGet(context) {

    try {
        console.log(`own url: ${context.request.url}`)
        const url = new URL(context.request.url);

        const ip = url.searchParams.get('ip');
        const port = url.searchParams.get('port');
        const networkType = url.searchParams.get('networkType');
        const https = JSON.parse(url.searchParams.get('https') || false);

        if (ip === undefined || port === undefined || networkType === undefined || https === undefined) {
            return Response.json({
                success: false,
                error: 'query parameter ip, port, networkType or https are undefined',
            });
        }

        let baseUrl = "";
        try {
            // test connection timeout
            baseUrl = `${https === true ? 'https' : 'http'}://${ip}${port == 80 ? '' : ':' + port}`;
            const url = `${baseUrl}/api/system`;

            console.log(`url: ${url}`);
            await ky.get(url, {
                timeout: 1_000 // 1 second
            });
        } catch (err) {
            console.log('failed to test connection timeout');
            return Response.json({
                success: false,
                error: err.message,
            });
        }

        console.log(`ip: ${ip}, port: ${port}, networkType: ${networkType}, https: ${https}`);

        const system = await ky.get(`${baseUrl}/api/system`, {
            timeout: 1000,
        }).json();
        console.log(`system: ${JSON.stringify(system, null, 2)}`);

        const peersInfo = await ky.get(`${baseUrl}/api/peers/info`, {
            timeout: 1000,
        }).json()
        console.log(`peersInfo: ${JSON.stringify(peersInfo, null, 2)}`);

        const peers = await await ky.get(`${baseUrl}/api/peers`, {
            timeout: 1000,
        }).json()
        console.log(`peers: ${JSON.stringify(peers, null, 2)}`);


        return Response.json({
            success: true,
            peers: peers.peers,
            peersInfo: peersInfo,
            system: system,
        });

    } catch (err) {
        return Response.json({
            success: false,
            error: err.message,
        });
    }
}
