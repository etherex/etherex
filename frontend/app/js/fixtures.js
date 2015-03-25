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
        }
    ],
    sub_contract_desc: [
        {
            "name": "send",
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
