var ether = "1000000000000000000";
var tenEther = "10000000000000000000";
var precision = "100000000";

var fixtures = {
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
    market_fields: 11,
    contract_desc: [
        {
            "name": "price",
            "type": "function",
            "inputs": [
                {
                    "name": "id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "price",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "buy",
            "type": "function",
            "inputs": [
                {
                    "name": "amount",
                    "type": "int256"
                },
                {
                    "name": "price",
                    "type": "int256"
                },
                {
                    "name": "market_id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "sell",
            "type": "function",
            "inputs": [
                {
                    "name": "amount",
                    "type": "int256"
                },
                {
                    "name": "price",
                    "type": "int256"
                },
                {
                    "name": "market_id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "trade",
            "type": "function",
            "inputs": [
                {
                    "name": "max_amount",
                    "type": "int256"
                },
                {
                    "name": "trade_ids",
                    "type": "int256[]"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "deposit",
            "type": "function",
            "inputs": [
                {
                    "name": "address",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "int256"
                },
                {
                    "name": "market_id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "withdraw",
            "type": "function",
            "inputs": [
                {
                    "name": "amount",
                    "type": "int256"
                },
                {
                    "name": "market_id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "cancel",
            "type": "function",
            "inputs": [
                {
                    "name": "id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "add_market",
            "type": "function",
            "inputs": [
                {
                    "name": "name",
                    "type": "int256"
                },
                {
                    "name": "contract",
                    "type": "int256"
                },
                {
                    "name": "decimals",
                    "type": "int256"
                },
                {
                    "name": "precision",
                    "type": "int256"
                },
                {
                    "name": "minimum",
                    "type": "int256"
                },
                {
                    "name": "category",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "get_last_market_id",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "out",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "get_market",
            "type": "function",
            "inputs": [
                {
                    "name": "id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "out",
                    "type": "uint256[]"
                }
            ]
        },
        {
            "name": "get_trade_ids",
            "type": "function",
            "inputs": [
                {
                    "name": "market_id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "trade_id",
                    "type": "uint256[]"
                }
            ]
        },
        {
            "name": "get_trade",
            "type": "function",
            "inputs": [
                {
                    "name": "id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "out",
                    "type": "uint256[]"
                }
            ]
        },
        {
            "name": "get_sub_balance",
            "type": "function",
            "inputs": [
                {
                    "name": "address",
                    "type": "int256"
                },
                {
                    "name": "market_id",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "out",
                    "type": "uint256[]"
                }
            ]
        },
        {
            "name": "log_price(int256,int256,int256,int256,int256)",
            "type": "event",
            "inputs": [
              { "name": "market", "type": "int256", "indexed": true },
              { "name": "type", "type": "int256", "indexed": false },
              { "name": "price", "type": "int256", "indexed": false },
              { "name": "amount", "type": "int256", "indexed": false },
              { "name": "timestamp", "type": "int256", "indexed": false }
            ]
        },
        {
            "name": "log_add_tx(int256,int256,int256,int256,int256)",
            "type": "event",
            "inputs": [
              { "name": "sender", "type": "int256", "indexed": true },
              { "name": "market", "type": "int256", "indexed": false },
              { "name": "type", "type": "int256", "indexed": false },
              { "name": "price", "type": "int256", "indexed": false },
              { "name": "amount", "type": "int256", "indexed": false }
            ]
        },
        {
            "name": "log_fill_tx(int256,int256,int256,int256,int256,int256,int256)",
            "type": "event",
            "inputs": [
              { "name": "sender", "type": "int256", "indexed": true },
              { "name": "owner", "type": "int256", "indexed": false },
              { "name": "market", "type": "int256", "indexed": false },
              { "name": "type", "type": "int256", "indexed": false },
              { "name": "trade", "type": "int256", "indexed": false },
              { "name": "price", "type": "int256", "indexed": false },
              { "name": "amount", "type": "int256", "indexed": false }
            ]
        },
        {
            "name": "log_deposit(int256,int256,int256)",
            "type": "event",
            "inputs": [
              { "name": "sender", "type": "int256", "indexed": true },
              { "name": "market", "type": "int256", "indexed": false },
              { "name": "amount", "type": "int256", "indexed": false }
            ]
        },
        {
            "name": "log_withdraw(int256,int256,int256)",
            "type": "event",
            "inputs": [
              { "name": "address", "type": "int256", "indexed": true },
              { "name": "market", "type": "int256", "indexed": false },
              { "name": "amount", "type": "int256", "indexed": false }
            ]
        },
        {
            "name": "log_cancel(int256,int256,int256,int256,int256)",
            "type": "event",
            "inputs": [
              { "name": "sender", "type": "int256", "indexed": true },
              { "name": "market", "type": "int256", "indexed": false },
              { "name": "trade", "type": "int256", "indexed": false },
              { "name": "price", "type": "int256", "indexed": false },
              { "name": "amount", "type": "int256", "indexed": false },
            ]
        }
    ],
    sub_contract_desc: [
        {
            "name": "transfer",
            "type": "function",
            "inputs": [
                {
                    "name": "recipient",
                    "type": "int256"
                },
                {
                    "name": "amount",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        },
        {
            "name": "balance",
            "type": "function",
            "inputs": [
                {
                    "name": "address",
                    "type": "int256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "int256"
                }
            ]
        }
    ]
};

module.exports = fixtures;
