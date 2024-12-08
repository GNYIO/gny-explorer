import express from 'express';
import ky from 'ky';
import bodyParser from 'body-parser';
import cors from 'cors';
import expressWinston from 'express-winston';
import winston from 'winston';

const app = express();
app.use(cors());


// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));




const domainsAllowList = [
    'testnet.gny.io',
    'mainnet.gny.io'
];


function isIp(input) {
    const regex = new RegExp('^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$');

    const result = regex.test(input);
    return result;
}

app.get('/request', async function (req, res) {

    const ip = req.query.ip;
    const port = Number(req.query.port);

    // validate ip
    const isIpOrIsInAllowlist = (isIp(ip) || domainsAllowList.includes(ip));
    if (!isIpOrIsInAllowlist) {
        return res.status(421).json({
            success: false,
            error: 'validation for ip failed',
        });
    }

    // validate port
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        return res.status(421).json({
            success: false,
            error: 'validation for port failed',
        });
    }

    let system;
    let peersInfo;
    let peers;
    try {
        system = await ky.get(`http://${ip}:${port}/api/system`, {
            timeout: 1000,
        }).json();

        peersInfo = await ky.get(`http://${ip}:${port}/api/peers/info`, {
            timeout: 1000,
        }).json()

        peers = await await ky.get(`http://${ip}:${port}/api/peers`, {
            timeout: 1000,
        }).json()

    } catch (err) {
        console.log(err.message)
        return res.json({
            success: false,
            error: 'error occured',
        });
    }

    return res.json({
        success: true,
        system,
        peersInfo,
        peers,
    });
})


app.listen('5000', '127.0.0.1', function (err) {
    console.log('server started...');
});
