/* Express App */
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import customLogger from '../utils/logger';
import { Connection } from '@gny/client';


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
        const port = req.query.port;
        const networkType = req.query.networkType;

        if (ip === undefined || port === undefined || networkType === undefined) {
            res.json({
              success: false,
              error: 'query parameter ip, port or networkType are undefined',
            });
            return;
        }

        console.log(`ip: ${ip}, port: ${port}, networkType: ${networkType}`);

        const conn = new Connection(
            ip,
            port,
            networkType,
            false
        );

        const peers = await conn.api.Peer.getPeers();

        res.json({
            success: true,
            peers: peers.peers
        });


        // res.json({
        //   success: true,
        //   peers: peers.peers,
        // });
        // return;
       
    } catch (err) {
        console.log(err)
        res.json({
          success: false,
          error: err.message,
        });
    }
  })

  


  // Setup routes
  app.use(routerBasePath, router)



  return app
}
