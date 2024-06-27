/* Express App */
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import customLogger from '../utils/logger';
import { Connection } from '@gnyio/client';
import got from 'got';

/* My express App */
export default function expressApp(functionName) {
  const app = express()

  // gzip responses
  app.use(compression())

  // Set router base path for local dev
  const routerBasePath = process.env.NODE_ENV === 'dev' ? `/${functionName}` : `/.netlify/functions/${functionName}/`
  const router = express.Router()

  // return transactions
  router.get('/', async (req, res) => {
    try {
        const ip = req.query.ip;
        const port = Number(req.query.port);
        const networkType = req.query.networkType;
        const https = JSON.parse(req.query.https);

        if (ip === undefined || port === undefined || networkType === undefined || https === undefined) {
            res.json({
              success: false,
              error: 'query parameter ip, port, networkType or https are undefined',
            });
            return;
        }

        try {
            // test connection timeout
            const url = `${https === true ? 'https' : 'http'}://${ip}${port == 80 ? '' : ':' + port}/api/system`;
            console.log(`url: ${url}`);
            await got(url, {
                timeout: {
                    connect: 500,
                    lookup: 500,
                }
            });
        } catch (err) {
            console.log('failed to test connection timeout');
            return res.json({
                success: false,
                error: err.message,
            });
        } 

        console.log(`ip: ${ip}, port: ${port}, networkType: ${networkType}, https: ${https}`);

        const conn = new Connection(
            ip,
            port,
            networkType,
            https
        );

        const system = await conn.api.System.getSystemInfo();
        const peersInfo = await conn.api.Peer.getInfo();
        const peers = await conn.api.Peer.getPeers();


        res.json({
            success: true,
            peers: peers.peers,
            peersInfo: peersInfo,
            system: system,
        });
        return;

       
    } catch (err) {
        console.log(err);
        res.json({
          success: false,
          error: err.message,
        });
        return;
    }
  })

  


  // Setup routes
  app.use(routerBasePath, router)



  return app
}
