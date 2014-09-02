var ether = "1000000000000000000";
var tenEther = "1000000000000000000";
var precision = "100000000";

var fixtures = {
    ether: ether,
    tenEther: tenEther,
    precision: precision,
    addresses: {
        nameregs: ["0xf298931b974dfb01b13e44eae9e4428afa3ba7f4", "0x50441127ea5b9dfd835a9aba4e1dc9c1257b58ca"],
        etherex: "0x3f2af2a311132b3730328a7b30db1025cd8579c3",
        trades: "0x54d1b757675b6f42d59ccc7c6d1c947536447f7d",
        markets: "0xad4665d4ffc60f0ea22a0f99dfc0988ce4b2c968"
    },
    market: {
        id: 1,
        name: "ETX",
        address: "0xdebd115297dbabd326ec3b1615a428b9ae090b9f",
        amount: ether,
        precision: precision
    },
    trades: {
        'f70097659f329a09': {
            id: 'f70097659f329a09',
            type: 'buy',
            amount: 312.12,
            price: 12,
            owner: '1a73636d',
            status: 'new',
            market: {
                id: 1,
                name: "ETX",
            }
        },
        'e92113a5cb209c12': {
            id: 'e92113a5cb209c12',
            type: 'sell',
            amount: 1.21,
            price: 0.00074797,
            owner: '1a73636d',
            status: 'new',
            market: {
                id: 2,
                name: "XBTC",
            }
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
