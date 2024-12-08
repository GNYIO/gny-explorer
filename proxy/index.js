import express from 'express';
import ky from 'ky';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());


// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// const endpoints = [
//     "/api/system",
//     "/api/peers/info",
//     "/api/peers"
// ];

app.get('/request', async function (req, res, next) {

    const ip = req.query.ip;
    const port = Number(req.query.port);

    console.log(req.query)
    console.log(`got request(ip: "${ip}", port: "${port}")`);

    // todo: validate ip
    if (!new RegExp('^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$').test(ip)) {
        return res.status(421).json({
            success: false,
            error: 'validation for ip failed',
        });
    }

    // todo: validate port
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
