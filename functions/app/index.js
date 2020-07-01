/* Express App */
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import customLogger from '../utils/logger';
import { Connection } from '@gny/client';
import { isAddress } from '@gny/utils';


// TARGET_IP (without http|https)
// TARGET_PORT
// TARGET_NETWORK_TYPE
// TARGET_HTTPS
const targetIp = process.env.TARGET_IP;
const targetPort = Number(process.env.TARGET_PORT);
const targetNetworkType = process.env.TARGET_NETWORK_TYPE;
const targetHttps = process.env.TARGET_HTTPS || false;

const magic = process.env.TARGET_HTTP_MAGIC;
const senderSecret = process.env.SENDER_SECRET;

const conn = new Connection(
  targetIp,
  targetPort,
  targetNetworkType,
  targetHttps
);

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
        const limit = req.query.limit || 10;
        const offset = req.query.offset || 0;
        console.log(`limit: ${limit}, offset: ${offset}`);

        const result = await conn.api.Transaction.getTransactions({
            message: 'faucet',
            type: 0,
            limit,
            offset,
        });
        if (result.success) {
            const transactions = result.transactions
              .filter(x => x.type === 0) // filter only type 0
              .map(x => ({
                date: x.timestamp,
                address: JSON.parse(x.args)[1],
                amount: JSON.parse(x.args)[0],
                transactionId: x.id,
              }));
            const count = result.count;
            res.json({
              transactions,
              count,
            });
        } else {
            res.json({
              transactions: [],
              count: 0
            });
        }
    } catch (err) {
        console.log(err)
        res.json({
          transactions: [],
          count: 0
        })
    }
  })

  


  // Setup routes
  app.use(routerBasePath, router)



  return app
}
