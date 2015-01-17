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
    trade_fields: 7,
    market_fields: 9,
    contract_desc: [
        {
            "name": "price",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "price",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "buy",
            "inputs": [
                {
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "name": "market_id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "sell",
            "inputs": [
                {
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "name": "market_id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "trade",
            "inputs": [
                {
                    "name": "trade_id",
                    "type": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "deposit",
            "inputs": [
                {
                    "name": "serpentbug",
                    "type": "uint256"
                },
                {
                    "name": "address",
                    "type": "hash256"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "name": "market_id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "withdraw",
            "inputs": [
                {
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "name": "market_id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "cancel",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "add_market",
            "inputs": [
                {
                    "name": "name",
                    "type": "uint256"
                },
                {
                    "name": "contract",
                    "type": "uint256"
                },
                {
                    "name": "decimals",
                    "type": "uint256"
                },
                {
                    "name": "precision",
                    "type": "uint256"
                },
                {
                    "name": "minimum",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "get_market",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "name": "name",
                    "type": "hash256"
                },
                {
                    "name": "contract",
                    "type": "hash256"
                },
                {
                    "name": "decimals",
                    "type": "uint256"
                },
                {
                    "name": "precision",
                    "type": "uint256"
                },
                {
                    "name": "minimum",
                    "type": "uint256"
                },
                {
                    "name": "last_price",
                    "type": "uint256"
                },
                {
                    "name": "owner",
                    "type": "hash256"
                },
                {
                    "name": "block",
                    "type": "uint256"
                },
                {
                    "name": "total_trades",
                    "type": "uint256"
                }
            ]
        },
        {
            "name": "get_trade_ids",
            "inputs": [
                {
                    "name": "market_id",
                    "type": "uint256"
                }
            ],
            "outputs": []
        },
        {
            "name": "get_trade",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "id",
                    "type": "hash256"
                },
                {
                    "name": "type",
                    "type": "uint256"
                },
                {
                    "name": "market",
                    "type": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "name": "owner",
                    "type": "hash256"
                },
                {
                    "name": "block",
                    "type": "uint256"
                },
                {
                    "name": "ref",
                    "type": "hash256"
                }
            ]
        },
        {
            "name": "get_sub_balance",
            "inputs": [
                {
                    "name": "address",
                    "type": "hash256"
                },
                {
                    "name": "market_id",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "available",
                    "type": "uint256"
                },
                {
                    "name": "trading",
                    "type": "uint256"
                }
            ]
        }
    ],
    sub_contract_desc: [
        {
            "name": "send",
            "inputs": [
                {
                    "name": "recipient",
                    "type": "uint256"
                },
                {
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "result",
                    "type": "uint256"
                }
            ]
        }
    ]
};

module.exports = fixtures;
