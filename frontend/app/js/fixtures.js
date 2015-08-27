var ether = "1000000000000000000";
var tenEther = "10000000000000000000";
var precision = "100000000";
var btc = "100000000";

var fixtures = {
  favicon: 'data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAABILAAASCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///////////8AAA//AAAP/wAAD///////////////////////////////////////////////////////4AA//+AAP//gAD//////////////////////////////////////////////////gAAf/4AAH/+AAB///////////8=',
  host: 'localhost:8545',
  ether: ether,
  tenEther: tenEther,
  precision: precision,
  btc: btc,
  addresses: {
      // nameregs: ["0xb46312830127306cd3de3b84dbdb51899613719d", "0xda7ce79725418f4f6e13bf5f520c89cec5f6a974"],
      etherex: "0x77045e71a7a2c50903d88e564cd72fab11e82051",
      btcswap: "0x757eb378cd038b7100ba612360fdabd1f4ffdb91"
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
    }
  ],
  tradeFields: 8,
  marketFields: 11,
  demo: {
    config: {
      network: 0,
      rangeEnd: 2475
    },
    network: {
      client: "Geth/v0.9.39/darwin/go1.4.2",
      peerCount: 0,
      blockChainAge: 12,
      blockNumber: 2945,
      blockTimestamp: new Date().getTime() / 1000 - 12,
      blockTime: 9,
      networkLag: 3
    },
    markets: {
      "market": {
        "id": 1,
        "name": "ETX",
        "address": "0xda7ce79725418f4f6e13bf5f520c89cec5f6a974",
        "category": 1,
        "decimals": 5,
        "minimum": 1000000000000000000,
        "precision": 100000000,
        "amountPrecision": "0.00001",
        "pricePrecision": "0.00000001",
        "priceDecimals": 8,
        "minimumTotal": "1.00000000",
        "lastPrice": 0.245,
        "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
        "block": 25,
        "totalTrades": 13,
        "balance": 690000,
        "favorite": true,
        "dayChange": "-8.70 %",
        "weekChange": "-",
        "monthChange": "-",
        "minTotal": 1,
        "messages": [],
        "txs": [
          {
            "hash": "0x73a5c2732869c617ba47663ae611ec62c27f28043052e36ffcd506856112b8d8",
            "type": "deposit",
            "block": 96,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "1000000000",
            "market": 1,
            "price": false,
            "total": false,
            "details": "+"
          },
          {
            "id": "-0x532472706860ae0897d66fc9a6fa0f72893aa09230735f4eaec4307b58a9a5df",
            "hash": "0xe1f91c691aae4bfc21be4d25e53889496b2092edc01d51ec49f081d7d5c7ac0b",
            "type": "cancel",
            "block": 2451,
            "inout": "in",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "10000000",
            "market": 1,
            "price": 0.24,
            "total": {
              "value": 24,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0xaa69efe7264bb2cd4ae7b8d10f2197e346cf6bc25c2a5d8d032faaca8f65a566",
            "hash": "0xaaf75659699209c2850dcdc2fe8899866f8886a9cc733f775381f2e2c7c88152",
            "type": "cancel",
            "block": 2448,
            "inout": "in",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "25000000",
            "market": 1,
            "price": 0.3,
            "total": {
              "value": 75,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x88fe89c97107dbd27c7701c72af3cad86dbff340dcf507a1a841a95e9a5db59a",
            "hash": "0xbe1518f5fca4721c882fa002151f79b6b6e699fab8b6eaa6227a416734f31046",
            "type": "cancel",
            "block": 1664,
            "inout": "in",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "25000000",
            "market": 1,
            "price": 0.32,
            "total": {
              "value": 80,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x12fd8c41a53f537a6302fbfe6e681e4d0b018a6885f9d042d0ea07911acbb594",
            "hash": "0xe2c52692236189a17645e220d60219df9897643212898d2758515c779ef1655d",
            "type": "sell",
            "block": 2461,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "25000000",
            "market": 1,
            "price": 0.25,
            "total": {
              "value": 62.5,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x532472706860ae0897d66fc9a6fa0f72893aa09230735f4eaec4307b58a9a5df",
            "hash": "0x9e95511ad64ef247b2aec4912ae2d84e24f2c7b4b32475ea2db740ad55716485",
            "type": "buy",
            "block": 2283,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "10000000",
            "market": 1,
            "price": 0.24,
            "total": {
              "value": 24,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0xd288d90ed8f488cf2946c2408912ddc8004f5b2f18d03bd3311ba2f6a814c2cd",
            "hash": "0x718336cea6907c5ca87703ce721296bc3c8f953af2d0671d138de6b7df9ddb8c",
            "type": "buy",
            "block": 1849,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "7500000",
            "market": 1,
            "price": 0.23,
            "total": {
              "value": 17.25,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x92d19a32d108e1919f6d9c656093a4a8a841509cc41c5c348ce114cdf456c5f8",
            "hash": "0x8ed79bd3be512ca07a64118401d391fe58ca38d80a84fa589cb96893d6807ccb",
            "type": "sell",
            "block": 1838,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "35000000",
            "market": 1,
            "price": 0.26,
            "total": {
              "value": 91,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x38b82c7e43fc06dfdd4d91c14979405a33c005c9d4208dbbc1be7afe3391d948",
            "hash": "0x06b96da8e9881a25cae901ec40a0b7e25a0c96f3c8823295c9be59823cfaf6ae",
            "type": "buy",
            "block": 164,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "5000000",
            "market": 1,
            "price": 0.24,
            "total": {
              "value": 12,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x7ababb3855988595a1d788c0eff30e9286882a14590e46438b8526721ee05516",
            "hash": "0xad26ee224648807cbfcbafc2255cab8d6ad2dfc7f725b5a40c2af6ba6dc35c91",
            "type": "buy",
            "block": 164,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "5000000",
            "market": 1,
            "price": 0.21,
            "total": {
              "value": 10.5,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x91cdd5f73c1da43db7aa568dd27b36c54a2e885601c89749422206fc6070f526",
            "hash": "0xc7753a3872529e5852ade6f52bfc1195a676af5ac30b548534b4e84548311108",
            "type": "buy",
            "block": 161,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "5000000",
            "market": 1,
            "price": 0.22,
            "total": {
              "value": 11,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x88fe89c97107dbd27c7701c72af3cad86dbff340dcf507a1a841a95e9a5db59a",
            "hash": "0x536e7cd300caac17bf55ffc6a36ea9b05a7e1275af78466688461cc2dc005d70",
            "type": "sell",
            "block": 161,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "25000000",
            "market": 1,
            "price": 0.32,
            "total": {
              "value": 80,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0xed22c36de05267470004b2e8bf56a72d98c0c39c2d5c1d29005f34638ec82ebe",
            "hash": "0x847dcccba56b93563fe628c7d9a810bd862f2d69aa3000472b9c29388e78ba4c",
            "type": "buy",
            "block": 129,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "5000000",
            "market": 1,
            "price": 0.23,
            "total": {
              "value": 11.5,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x8bbafeb15a6cc9e21faacd809f86a40d428bbc72d0655e62368d493c6ec20f35",
            "hash": "0xc15ed612f54a7b20bda23e69dd4a52e211c5b3e1836cd3a700a118a92948ca84",
            "type": "sell",
            "block": 128,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "55000000",
            "market": 1,
            "price": 0.28,
            "total": {
              "value": 154,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x2853fb026885a7b27458abc70fed9a5e4feb1eb163ae8ca8aa20db1645cff3fe",
            "hash": "0x9935b8fe7cd78d50b1c7ad672092ad4029286bb679b94e736db37f6a1bfff238",
            "type": "sell",
            "block": 125,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "35000000",
            "market": 1,
            "price": 0.26,
            "total": {
              "value": 91,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x15a9f9396d5055c4de736ab2fc66ecf159d35b78e7d113993a3b6e1f67f7672",
            "hash": "0x505a0bc025f0e067673b6660f3d648032ba02e633ce4af7f2cfb2d2ec396ee4e",
            "type": "sell",
            "block": 125,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "45000000",
            "market": 1,
            "price": 0.27,
            "total": {
              "value": 121.5,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0x18d96a79d898768ab3f6a953235717dadd59fb5522e666ae6286945ca7226ad8",
            "hash": "0x1c908eab7a25f8d0249df0a31e4aab4462531b1309dbf5fcca4951c01e2d41be",
            "type": "sell",
            "block": 124,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "15000000",
            "market": 1,
            "price": 0.25,
            "total": {
              "value": 37.5,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0xa756387e7e9a63eb1daef3ac159e5873ea3769a4b1587dfec2cc9e2030483739",
            "hash": "0xf7cf2ab7a47feb44e1b44f0b15e171973e11d5055a9af2b3239448b33ecb30b5",
            "type": "sell",
            "block": 103,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "5000000",
            "market": 1,
            "price": 0.25,
            "total": {
              "value": 12.5,
              "unit": "ether"
            },
            "details": "+"
          },
          {
            "id": "-0xaa69efe7264bb2cd4ae7b8d10f2197e346cf6bc25c2a5d8d032faaca8f65a566",
            "hash": "0x518ec84ab99ab00fb81e557381579dac288cf0f6e909b406220d6026b129d106",
            "type": "sell",
            "block": 102,
            "inout": "out",
            "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
            "amount": "25000000",
            "market": 1,
            "price": 0.3,
            "total": {
              "value": 75,
              "unit": "ether"
            },
            "details": "+"
          }
        ],
        "data": [
          {
            "Date": "2015-07-10T06:46:15.000Z",
            "Open": 0.25,
            "High": 0.25,
            "Low": 0.25,
            "Close": 0.25,
            "Volume": 50
          },
          {
            "Date": "2015-07-10T07:04:57.000Z",
            "Open": 0.25,
            "High": 0.24,
            "Low": 0.24,
            "Close": 0.24,
            "Volume": 25
          },
          {
            "Date": "2015-07-10T07:05:18.000Z",
            "Open": 0.24,
            "High": 0.25,
            "Low": 0.25,
            "Close": 0.25,
            "Volume": 50
          },
          {
            "Date": "2015-07-10T07:31:14.000Z",
            "Open": 0.25,
            "High": 0.24,
            "Low": 0.24,
            "Close": 0.24,
            "Volume": 25
          },
          {
            "Date": "2015-07-10T07:45:07.000Z",
            "Open": 0.24,
            "High": 0.25,
            "Low": 0.25,
            "Close": 0.25,
            "Volume": 100
          },
          {
            "Date": "2015-07-10T08:04:51.000Z",
            "Open": 0.25,
            "High": 0.26,
            "Low": 0.26,
            "Close": 0.26,
            "Volume": 350
          },
          {
            "Date": "2015-07-10T08:08:06.000Z",
            "Open": 0.26,
            "High": 0.23,
            "Low": 0.23,
            "Close": 0.23,
            "Volume": 50
          }
        ],
        "prices": [
          {
            "timestamp": 1436510775,
            "type": 2,
            "price": 0.25,
            "amount": 50
          },
          {
            "timestamp": 1436511918,
            "type": 2,
            "price": 0.25,
            "amount": 50
          },
          {
            "timestamp": 1436514307,
            "type": 2,
            "price": 0.25,
            "amount": 100
          },
          {
            "timestamp": 1436515686,
            "type": 1,
            "price": 0.23,
            "amount": 50
          },
          {
            "timestamp": 1436515491,
            "type": 2,
            "price": 0.26,
            "amount": 350
          },
          {
            "timestamp": 1436513474,
            "type": 1,
            "price": 0.24,
            "amount": 25
          },
          {
            "timestamp": 1436511897,
            "type": 1,
            "price": 0.24,
            "amount": 25
          }
        ],
        "available": 7800,
        "trading": 2300,
        "dayClass": "text-danger",
        "daySign": "-"
      },
      "markets": [
        {
          "id": 1,
          "name": "ETX",
          "address": "0xda7ce79725418f4f6e13bf5f520c89cec5f6a974",
          "category": 1,
          "decimals": 5,
          "minimum": 1000000000000000000,
          "precision": 100000000,
          "amountPrecision": "0.00001",
          "pricePrecision": "0.00000001",
          "priceDecimals": 8,
          "minimumTotal": "1.00000000",
          "lastPrice": 0.245,
          "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
          "block": 25,
          "totalTrades": 13,
          "balance": 690000,
          "favorite": true,
          "dayChange": "-8.70 %",
          "weekChange": "-",
          "monthChange": "-",
          "minTotal": 1,
          "txs": [
            {
              "hash": "0x73a5c2732869c617ba47663ae611ec62c27f28043052e36ffcd506856112b8d8",
              "type": "deposit",
              "block": 96,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "1000000000",
              "market": 1,
              "price": false,
              "total": false,
              "details": "+"
            },
            {
              "id": "-0x532472706860ae0897d66fc9a6fa0f72893aa09230735f4eaec4307b58a9a5df",
              "hash": "0xe1f91c691aae4bfc21be4d25e53889496b2092edc01d51ec49f081d7d5c7ac0b",
              "type": "cancel",
              "block": 2451,
              "inout": "in",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "10000000",
              "market": 1,
              "price": 0.24,
              "total": {
                "value": 24,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0xaa69efe7264bb2cd4ae7b8d10f2197e346cf6bc25c2a5d8d032faaca8f65a566",
              "hash": "0xaaf75659699209c2850dcdc2fe8899866f8886a9cc733f775381f2e2c7c88152",
              "type": "cancel",
              "block": 2448,
              "inout": "in",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "25000000",
              "market": 1,
              "price": 0.3,
              "total": {
                "value": 75,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x88fe89c97107dbd27c7701c72af3cad86dbff340dcf507a1a841a95e9a5db59a",
              "hash": "0xbe1518f5fca4721c882fa002151f79b6b6e699fab8b6eaa6227a416734f31046",
              "type": "cancel",
              "block": 1664,
              "inout": "in",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "25000000",
              "market": 1,
              "price": 0.32,
              "total": {
                "value": 80,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x12fd8c41a53f537a6302fbfe6e681e4d0b018a6885f9d042d0ea07911acbb594",
              "hash": "0xe2c52692236189a17645e220d60219df9897643212898d2758515c779ef1655d",
              "type": "sell",
              "block": 2461,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "25000000",
              "market": 1,
              "price": 0.25,
              "total": {
                "value": 62.5,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x532472706860ae0897d66fc9a6fa0f72893aa09230735f4eaec4307b58a9a5df",
              "hash": "0x9e95511ad64ef247b2aec4912ae2d84e24f2c7b4b32475ea2db740ad55716485",
              "type": "buy",
              "block": 2283,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "10000000",
              "market": 1,
              "price": 0.24,
              "total": {
                "value": 24,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0xd288d90ed8f488cf2946c2408912ddc8004f5b2f18d03bd3311ba2f6a814c2cd",
              "hash": "0x718336cea6907c5ca87703ce721296bc3c8f953af2d0671d138de6b7df9ddb8c",
              "type": "buy",
              "block": 1849,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "7500000",
              "market": 1,
              "price": 0.23,
              "total": {
                "value": 17.25,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x92d19a32d108e1919f6d9c656093a4a8a841509cc41c5c348ce114cdf456c5f8",
              "hash": "0x8ed79bd3be512ca07a64118401d391fe58ca38d80a84fa589cb96893d6807ccb",
              "type": "sell",
              "block": 1838,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "35000000",
              "market": 1,
              "price": 0.26,
              "total": {
                "value": 91,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x38b82c7e43fc06dfdd4d91c14979405a33c005c9d4208dbbc1be7afe3391d948",
              "hash": "0x06b96da8e9881a25cae901ec40a0b7e25a0c96f3c8823295c9be59823cfaf6ae",
              "type": "buy",
              "block": 164,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "5000000",
              "market": 1,
              "price": 0.24,
              "total": {
                "value": 12,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x7ababb3855988595a1d788c0eff30e9286882a14590e46438b8526721ee05516",
              "hash": "0xad26ee224648807cbfcbafc2255cab8d6ad2dfc7f725b5a40c2af6ba6dc35c91",
              "type": "buy",
              "block": 164,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "5000000",
              "market": 1,
              "price": 0.21,
              "total": {
                "value": 10.5,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x91cdd5f73c1da43db7aa568dd27b36c54a2e885601c89749422206fc6070f526",
              "hash": "0xc7753a3872529e5852ade6f52bfc1195a676af5ac30b548534b4e84548311108",
              "type": "buy",
              "block": 161,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "5000000",
              "market": 1,
              "price": 0.22,
              "total": {
                "value": 11,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x88fe89c97107dbd27c7701c72af3cad86dbff340dcf507a1a841a95e9a5db59a",
              "hash": "0x536e7cd300caac17bf55ffc6a36ea9b05a7e1275af78466688461cc2dc005d70",
              "type": "sell",
              "block": 161,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "25000000",
              "market": 1,
              "price": 0.32,
              "total": {
                "value": 80,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0xed22c36de05267470004b2e8bf56a72d98c0c39c2d5c1d29005f34638ec82ebe",
              "hash": "0x847dcccba56b93563fe628c7d9a810bd862f2d69aa3000472b9c29388e78ba4c",
              "type": "buy",
              "block": 129,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "5000000",
              "market": 1,
              "price": 0.23,
              "total": {
                "value": 11.5,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x8bbafeb15a6cc9e21faacd809f86a40d428bbc72d0655e62368d493c6ec20f35",
              "hash": "0xc15ed612f54a7b20bda23e69dd4a52e211c5b3e1836cd3a700a118a92948ca84",
              "type": "sell",
              "block": 128,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "55000000",
              "market": 1,
              "price": 0.28,
              "total": {
                "value": 154,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x2853fb026885a7b27458abc70fed9a5e4feb1eb163ae8ca8aa20db1645cff3fe",
              "hash": "0x9935b8fe7cd78d50b1c7ad672092ad4029286bb679b94e736db37f6a1bfff238",
              "type": "sell",
              "block": 125,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "35000000",
              "market": 1,
              "price": 0.26,
              "total": {
                "value": 91,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x15a9f9396d5055c4de736ab2fc66ecf159d35b78e7d113993a3b6e1f67f7672",
              "hash": "0x505a0bc025f0e067673b6660f3d648032ba02e633ce4af7f2cfb2d2ec396ee4e",
              "type": "sell",
              "block": 125,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "45000000",
              "market": 1,
              "price": 0.27,
              "total": {
                "value": 121.5,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0x18d96a79d898768ab3f6a953235717dadd59fb5522e666ae6286945ca7226ad8",
              "hash": "0x1c908eab7a25f8d0249df0a31e4aab4462531b1309dbf5fcca4951c01e2d41be",
              "type": "sell",
              "block": 124,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "15000000",
              "market": 1,
              "price": 0.25,
              "total": {
                "value": 37.5,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0xa756387e7e9a63eb1daef3ac159e5873ea3769a4b1587dfec2cc9e2030483739",
              "hash": "0xf7cf2ab7a47feb44e1b44f0b15e171973e11d5055a9af2b3239448b33ecb30b5",
              "type": "sell",
              "block": 103,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "5000000",
              "market": 1,
              "price": 0.25,
              "total": {
                "value": 12.5,
                "unit": "ether"
              },
              "details": "+"
            },
            {
              "id": "-0xaa69efe7264bb2cd4ae7b8d10f2197e346cf6bc25c2a5d8d032faaca8f65a566",
              "hash": "0x518ec84ab99ab00fb81e557381579dac288cf0f6e909b406220d6026b129d106",
              "type": "sell",
              "block": 102,
              "inout": "out",
              "from": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
              "to": "0x77045e71a7a2c50903d88e564cd72fab11e82051",
              "amount": "25000000",
              "market": 1,
              "price": 0.3,
              "total": {
                "value": 75,
                "unit": "ether"
              },
              "details": "+"
            }
          ],
          "data": [
            {
              "Date": "2015-07-10T06:46:15.000Z",
              "Open": 0.25,
              "High": 0.25,
              "Low": 0.25,
              "Close": 0.25,
              "Volume": 50
            },
            {
              "Date": "2015-07-10T07:04:57.000Z",
              "Open": 0.25,
              "High": 0.24,
              "Low": 0.24,
              "Close": 0.24,
              "Volume": 25
            },
            {
              "Date": "2015-07-10T07:05:18.000Z",
              "Open": 0.24,
              "High": 0.25,
              "Low": 0.25,
              "Close": 0.25,
              "Volume": 50
            },
            {
              "Date": "2015-07-10T07:31:14.000Z",
              "Open": 0.25,
              "High": 0.24,
              "Low": 0.24,
              "Close": 0.24,
              "Volume": 25
            },
            {
              "Date": "2015-07-10T07:45:07.000Z",
              "Open": 0.24,
              "High": 0.25,
              "Low": 0.25,
              "Close": 0.25,
              "Volume": 100
            },
            {
              "Date": "2015-07-10T08:04:51.000Z",
              "Open": 0.25,
              "High": 0.26,
              "Low": 0.26,
              "Close": 0.26,
              "Volume": 350
            },
            {
              "Date": "2015-07-10T08:08:06.000Z",
              "Open": 0.26,
              "High": 0.23,
              "Low": 0.23,
              "Close": 0.23,
              "Volume": 50
            }
          ],
          "prices": [
            {
              "timestamp": 1436510775,
              "type": 2,
              "price": 0.25,
              "amount": 50
            },
            {
              "timestamp": 1436511918,
              "type": 2,
              "price": 0.25,
              "amount": 50
            },
            {
              "timestamp": 1436514307,
              "type": 2,
              "price": 0.25,
              "amount": 100
            },
            {
              "timestamp": 1436515686,
              "type": 1,
              "price": 0.23,
              "amount": 50
            },
            {
              "timestamp": 1436515491,
              "type": 2,
              "price": 0.26,
              "amount": 350
            },
            {
              "timestamp": 1436513474,
              "type": 1,
              "price": 0.24,
              "amount": 25
            },
            {
              "timestamp": 1436511897,
              "type": 1,
              "price": 0.24,
              "amount": 25
            }
          ],
          "available": 7800,
          "trading": 2300,
          "dayClass": "text-danger",
          "daySign": "-",
          "messages": []
        },
        {
          "id": 2,
          "name": "CAK",
          "address": "0x83c5541a6c8d2dbad642f385d8d06ca9b6c731ee",
          "category": 1,
          "decimals": 4,
          "minimum": 1000000000000000000,
          "precision": 1000,
          "amountPrecision": "0.0001",
          "pricePrecision": "0.001",
          "priceDecimals": 3,
          "minimumTotal": "1.000",
          "lastPrice": 0.024,
          "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
          "block": 28,
          "totalTrades": 9,
          "balance": 3000000,
          "favorite": true,
          "dayChange": "-",
          "weekChange": "-",
          "monthChange": "-",
          "available": 925500,
          "trading": 75000,
          "txs": [],
          "data": [],
          "prices": [],
          "messages": []
        },
        {
          "id": 3,
          "name": "MID",
          "address": "0xe0825f57dd05ef62ff731c27222a86e104cc4cad",
          "category": 3,
          "decimals": 3,
          "minimum": 1000000000000000000,
          "precision": 10000,
          "amountPrecision": "0.001",
          "pricePrecision": "0.0001",
          "priceDecimals": 4,
          "minimumTotal": "1.0000",
          "lastPrice": 0.0025,
          "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
          "block": 30,
          "totalTrades": 9,
          "balance": 30000000,
          "favorite": false,
          "dayChange": "-",
          "weekChange": "-",
          "monthChange": "-",
          "available": 8450000,
          "trading": 1550000,
          "txs": [],
          "data": [],
          "prices": [],
          "messages": []
        }
      ],
      "favorites": [
        1,
        2
      ],
      "lastMarketID": 3,
      "lastOpenedMarketID": 1,
      "progress": 3,
      "loading": false,
      "error": null
    },
    trades: {
      "trades": {
        "buys": [
          {
            "id": "-0x3a0bda455e4434e7b9a2eff4e6c6e722266f27d4acd4c259d9d1880e2f3261c7",
            "type": "buys",
            "price": 0.24,
            "amount": 50,
            "total": 12,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875428
          },
          {
            "id": "-0xe6928c317ecbd7877ef708e0447839b0429448ee4950d448b59be2b6607a3971",
            "type": "buys",
            "price": 0.23,
            "amount": 50,
            "total": 11.5,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875426
          },
          {
            "id": "-0x7aebc2f9c1c2be1e337e612825ad35a8ceb8ec596723fb29a79046a63a17766c",
            "type": "buys",
            "price": 0.22,
            "amount": 50,
            "total": 11,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875426
          },
          {
            "id": "-0xd7b8ea6c21816e3fddbe916aebbc515c44dfdce84373d1de2db4343015f5127c",
            "type": "buys",
            "price": 0.21,
            "amount": 50,
            "total": 10.5,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875428
          }
        ],
        "sells": [
          {
            "id": "-0x5dfe7749c4ddf97c55783fbbcd4f05fdeb7ce623108dbb92bb6be1301c54c212",
            "type": "sells",
            "price": 0.25,
            "amount": 150,
            "total": 37.5,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875424
          },
          {
            "id": "-0xd84efd3e6504215e5b73a674e8a35a09aaffd32277ba556511176b782bb342b1",
            "type": "sells",
            "price": 0.25,
            "amount": 250,
            "total": 62.5,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875424
          },
          {
            "id": "-0xd3ae03fab932d794ddfe7acdc338ea37cc25fcf8f8d1ba9fe9b0e5208256015f",
            "type": "sells",
            "price": 0.26,
            "amount": 350,
            "total": 91,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875424
          },
          {
            "id": "-0x1444f6eb306fae50db5d9af2fb4e61e9b1dbf65bd74b8b14b85a32cdb7efdc4c",
            "type": "sells",
            "price": 0.27,
            "amount": 450,
            "total": 121.50000000000001,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875424
          },
          {
            "id": "-0xd0511cb50e0645b386e6958d587de78f26f136ad8a96190af61aa06e5202629e",
            "type": "sells",
            "price": 0.28,
            "amount": 550,
            "total": 154.00000000000003,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875426
          },
          {
            "id": "0x9437490062c7c71e2cda06c255d46adf5da7bb315f7f1dd34d1713a9f6f0e86",
            "type": "sells",
            "price": 0.29,
            "amount": 15,
            "total": 4.35,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875426
          },
          {
            "id": "-0x51dc0f5b65f03b21591c4a0839f22bef37b241a2b1b9865fd696df7d09af37da",
            "type": "sells",
            "price": 0.3,
            "amount": 250,
            "total": 75,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875424
          },
          {
            "id": "-0x7a3d7d3d5b7b9de36cb6cafbfa5e478875ef13b37ad32577c02ef2c27d483e33",
            "type": "sells",
            "price": 0.31,
            "amount": 250,
            "total": 77.5,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875424
          },
          {
            "id": "-0x5c4cf7ae3f2bfd1405547b3090deff9577fbeb3f7325af959c2da865d82071f6",
            "type": "sells",
            "price": 0.32,
            "amount": 250,
            "total": 80,
            "owner": "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            "market": {
              "id": 1,
              "name": "ETX"
            },
            "status": "mined",
            "block": 875426
          }
        ]
      },
      "loading": false,
      "updating": false,
      "error": null,
      "title": "Trades",
      "percent": 100,
      "progress": 13,
      "tradeIDs": [
        "-0xd7b8ea6c21816e3fddbe916aebbc515c44dfdce84373d1de2db4343015f5127c",
        "-0x3a0bda455e4434e7b9a2eff4e6c6e722266f27d4acd4c259d9d1880e2f3261c7",
        "-0x5c4cf7ae3f2bfd1405547b3090deff9577fbeb3f7325af959c2da865d82071f6",
        "-0x7aebc2f9c1c2be1e337e612825ad35a8ceb8ec596723fb29a79046a63a17766c",
        "-0xe6928c317ecbd7877ef708e0447839b0429448ee4950d448b59be2b6607a3971",
        "0x9437490062c7c71e2cda06c255d46adf5da7bb315f7f1dd34d1713a9f6f0e86",
        "-0xd0511cb50e0645b386e6958d587de78f26f136ad8a96190af61aa06e5202629e",
        "-0x1444f6eb306fae50db5d9af2fb4e61e9b1dbf65bd74b8b14b85a32cdb7efdc4c",
        "-0xd3ae03fab932d794ddfe7acdc338ea37cc25fcf8f8d1ba9fe9b0e5208256015f",
        "-0xd84efd3e6504215e5b73a674e8a35a09aaffd32277ba556511176b782bb342b1",
        "-0x5dfe7749c4ddf97c55783fbbcd4f05fdeb7ce623108dbb92bb6be1301c54c212",
        "-0x7a3d7d3d5b7b9de36cb6cafbfa5e478875ef13b37ad32577c02ef2c27d483e33",
        "-0x51dc0f5b65f03b21591c4a0839f22bef37b241a2b1b9865fd696df7d09af37da"
      ],
      "type": 1,
      "price": null,
      "amount": null,
      "total": null,
      "filling": [],
      "estimate": 0,
      "message": "",
      "note": "",
      "amountLeft": 0,
      "available": 0,
      "newAmount": false
    },
    user: {
      "user": {
        "loading": true,
        "id": "0x239eb5afa5b1da814a3ccb60e79de1f933f1b470",
        "balance": 3866.53390136035,
        "balanceFormatted": {
          "value": 3.8665339013603495,
          "unit": "Kether"
        },
        "balancePending": 0,
        "balanceSub": 0,
        "balanceSubAvailable": 600,
        "balanceSubTrading": 0,
        "balanceSubPending": 0,
        "addresses": [
          "0x239eb5afa5b1da814a3ccb60e79de1f933f1b470",
          "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826"
        ],
        "own": false,
        "balanceWei": 3.8665339013603493e+21
      },
      "defaultAccount": "0x239eb5afa5b1da814a3ccb60e79de1f933f1b470",
      "loading": false,
      "error": null
    }
  }
};

module.exports = fixtures;
