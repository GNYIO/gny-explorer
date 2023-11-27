import * as x from '@gny/client';

// 1. add "type":"module", to package.json
// 2. call this script: node --es-module-specifier-resolution=node create_dats.js


const connection = new x.Connection('127.0.0.1', 4096, 'localnet', false);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const genesis = 'summer produce nation depth home scheme trade pitch marble season crumble autumn';

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function makeHash(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function registerDatMaker(name) {
  try {
    console.log(`register: ${name}`);
    const trs = await connection.contract.Dat.registerDatMaker(name, 'predictions', genesis);
    console.log(JSON.stringify(trs, null, 2));

    await sleep(15 * 1000);
  } catch (err) {
    console.log(err.response.data);
  }
}

async function registerDat(makerName) {
  try {
    const coin = makerName.split('_')[0]; // takes BTC from BTC_PREDICTION

    const year = '2023';
    const month = randomIntFromInterval(1, 12);
    const day = randomIntFromInterval(1, 28);

    const datName = `${year}${month}${day}_${coin}`;
    console.log(`datName: ${datName}, makerName: ${makerName}`);

    const hash = makeHash(50);

    const url = 'https://test.com/test';

    const trs = await connection.contract.Dat.createDat(datName, hash, makerName, url, genesis);
    console.log(JSON.stringify(trs, null, 2));

    await sleep(7 * 1000);
  } catch (err) {
    console.log(err.response.data);
  }

}

(async () => {

  const makers = [
    'BTC_PREDICTION',
    'ETH_PREDICTION',
    'MATIC_PREDICTION',
    'TEST_PREDICTION',
    'hello_PREDICTION',
    'asdf_PREDICTION',
    'erer_PREDICTION',
    'iii_PREDICTION',
  ];

  for (const m of makers) {
    await registerDatMaker(m);
  }

  for (const n of [...makers, ...makers, ...makers, ...makers, ...makers]) {
    await registerDat(n);
  }


})();

