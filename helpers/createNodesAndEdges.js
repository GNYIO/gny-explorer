
const client = require('@gny/client');
const BigNumber = require('bignumber.js');


const con = new client.Connection(
  process.env['GNY_ENDPOINT'],
  Number(process.env['GNY_PORT']),
  process.env['GNY_NETWORK'],
  JSON.parse(process.env['GNY_HTTPS'] || false),
);




async function getAllTransfers(i) {
  const total = await con.api.Transfer.getRoot({
    ownerId: i,
  });
  console.log(total.count);

  const allTransfers = [];
  let offset = 0;
  while (true) {
    console.log(`[${i}] offset: ${offset}`);
    const { transfers } = await con.api.Transfer.getRoot({
      ownerId: i,
      limit: 100,
      offset: offset,
    });

    if (transfers.length === 0) {
      break;
    }

    allTransfers.push(...transfers);
    offset += 100;
  }
  console.log(`length of result: ${allTransfers.length}`);
  return allTransfers;
}

function onlyGNYTransfers(transfers) {
  return transfers.filter(x => x.currency === 'GNY');
}

function getAllNodes(transfers, mainNode) {
  const set = new Set();
  for (let t of transfers) {
    set.add(t.senderId);
    set.add(t.recipientId);
  }
  const nodes = Array.from(set);

  const fullNodes = nodes.map(x => {
    const one = ({
      id: x,
      color: '#67a8af',
      value: 1,
      title: x,
    });

    if (x === mainNode) {
      one.color = '#87ceeb';
      one.value = 5;
    }
    return one;
  });

  return fullNodes;
}

function groupBySenderAndRecipient(transfers) {
  const myMap = new Map();
  
  for (let t of transfers) {
    const key = `${t.senderId}-${t.recipientId}`;
    const prettyAmount = new BigNumber(t.amount).dividedBy(1e8).toString();


    if(!myMap.has(key)) {
      myMap.set(key, prettyAmount);
    } else {
      const prev = myMap.get(key);
      const result = new BigNumber(prev).plus(prettyAmount).toString();
      myMap.set(key, result);
    }
  }

  // cut off any decimal places
  return Array.from(myMap).map(x => {
    const value = x[1];
    x[1] = new BigNumber(value).toFixed(0);
    return x;
  });

}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



function createEdges(grouped, mainNode) {
  const edges = [];

  for (let i of grouped) {
    const fromTo = i[0];
    const value = i[1];

    const from = fromTo.split('-')[0];
    const to = fromTo.split('-')[1];

    const edge = {
      from: from,
      to: to,
      color: from === mainNode ? 'red' : 'green',
      length: 30,
      title: `sum ${numberWithCommas(value)} GNY`,
      arrow: 'from',
      extra: value,
    };
    edges.push(edge);
  }
  return edges;
}

function createEdgeWith(edges) {

  for (let i = 0; i < edges.length; ++i) {
    const one = edges[i];
    
    const extra = one.extra;
    if (extra >= 100_000_000) {
      one.width = 5;
    } else if (extra >= 100_000) {
      one.width = 3;
    } else {
      one.width = 0.5;
    }

  }

  return edges;
}


export async function getNodesAndEdges(address) {
  const result = await getAllTransfers(address);
  const onlyGnyTransfers = onlyGNYTransfers(result);

  // nodes
  const nodes = getAllNodes(onlyGnyTransfers, address);

  // edges
  const groupedBySenderAndRecipient = groupBySenderAndRecipient(onlyGnyTransfers);
  const edges = createEdges(groupedBySenderAndRecipient, address);

  const edgesWithWidth = createEdgeWith(edges);

  return {
    nodes,
    edges: edgesWithWidth,
  };
} 
