var ether = "1000000000000000000";
var tenEther = "10000000000000000000";
var precision = "100000000";

var fixtures = {
    host: 'localhost:8545',
    ether: ether,
    tenEther: tenEther,
    precision: precision,
    addresses: {
        nameregs: ["0xb46312830127306cd3de3b84dbdb51899613719d", "0xda7ce79725418f4f6e13bf5f520c89cec5f6a974"],
        etherex: "0x77045e71a7a2c50903d88e564cd72fab11e82051"
    },
    categories: [
      {
        id: 1,
        key: "subs",
        name: "Subcurrencies"
      },
      {
        id: 2,
        key: "xchain",
        name: "Crypto-currencies"
      },
      {
        id: 3,
        key: "assets",
        name: "Real-world assets"
      },
      {
        id: 4,
        key: "currencies",
        name: "Fiat currencies"
      },
    ],
    trade_fields: 8,
    market_fields: 11
};

module.exports = fixtures;
