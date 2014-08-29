var Ethereum = require("ethereumjs-lib");

var fixtures = {
    user: {
        id: "1a73636d",
        name: "Alice",
        deposit: 12
    },
    market: {
        id: 1,
        name: "ETX"
    },
    markets: [
    {
        id: 1,
        name: "ETX",
        address: "0xdebd115297dbabd326ec3b1615a428b9ae090b9f",
        amount: Ethereum.BigInteger("10").pow(18),
        precision: Ethereum.BigInteger("10").pow(8)
    },
    {
        id: 2,
        name: "XBTC",
        address: "0xad4665d4ffc60f0ea22a0f99dfc0988ce4b2c968",
        amount: Ethereum.BigInteger("10").pow(18),
        precision: Ethereum.BigInteger("10").pow(8)
    },
    {
        id: 3,
        name: "CAK",
        address: "0xac873234d24964d3ef3ded0aa77493b40e5e5cf5",
        amount: Ethereum.BigInteger("10").pow(18),
        precision: Ethereum.BigInteger("10").pow(8)
    },
    {
        id: 4,
        name: "FAB",
        address: "0xffabe02d3ef93ee947dd534e032812a41a109555",
        amount: Ethereum.BigInteger("10").pow(18),
        precision: Ethereum.BigInteger("10").pow(8)
    }],
    trades: {
        'f70097659f329a09': {
            id: 'f70097659f329a09',
            type: 'buy',
            category: 'product',
            description: 'Garden gnome',
            price: 12,
            buyerId: '1a73636d',
            sellerId: '91c24063',
            status: 'new',
            expiration: '31/12/2014',
            escrowPct: 100.0,
            insurancePct: 50.0,
            statusText: 'awaiting insurance',
            references: [{
                id: 'f7009765',
                insurerId: 'f7009765',
                liability: 6,
                premiumPct: 10.0
            }]
        },
        'e92113a5cb209c12': {
            id: 'e92113a5cb209c12',
            type: 'sell',
            category: 'product',
            description: 'Lawnmower',
            price: 66,
            sellerId: '1a73636d',
            status: 'new',
            expiration: '15/10/2014',
            escrowPct: 100.0,
            insurancePct: 50.0,
            statusText: 'awaiting insurance',
            references: [{
                id: 'f7009765',
                insurerId: 'f7009765',
                liability: 6,
                premiumPct: 10.0
            }]
        }
    },
    referencesList: [
    {
        id: 'f7009765',
        traderId: '91c24063',
        maxLiability: 12,
        premiumPct: 10,
        lockedLiability: 6
    },
    {
        id: '812d3340',
        traderId: '12345678',
        maxLiability: 0,
        premiumPct: 0,
        lockedLiability: 0
    }],
    contacts: {
        '91c24063': {
            id: '91c24063',
            name: 'Andrew'
        },
        'f7009765': {
            id: 'f7009765',
            name: 'John'
        }
    }
};

module.exports = fixtures;
