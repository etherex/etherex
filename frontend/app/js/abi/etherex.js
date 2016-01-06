module.exports = [
    {
        "constant": false,
        "type": "function",
        "name": "add_market(int256,int256,int256,int256,int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "name"
            },
            {
                "type": "int256",
                "name": "contract"
            },
            {
                "type": "int256",
                "name": "decimals"
            },
            {
                "type": "int256",
                "name": "precision"
            },
            {
                "type": "int256",
                "name": "minimum"
            },
            {
                "type": "int256",
                "name": "category"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "buy(int256,int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "amount"
            },
            {
                "type": "int256",
                "name": "price"
            },
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "cancel(int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "trade_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "deposit(int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "amount"
            },
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_last_market_id()",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": []
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_market(int256)",
        "outputs": [
            {
                "type": "int256[]",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_market_id(int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "address"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_market_id_by_name(int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "name"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_sub_balance(int256,int256)",
        "outputs": [
            {
                "type": "int256[]",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "address"
            },
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_trade(int256)",
        "outputs": [
            {
                "type": "int256[]",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "get_trade_ids(int256)",
        "outputs": [
            {
                "type": "int256[]",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "price(int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "sell(int256,int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "amount"
            },
            {
                "type": "int256",
                "name": "price"
            },
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "trade(int256,int256[])",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "max_amount"
            },
            {
                "type": "int256[]",
                "name": "trade_ids"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "withdraw(int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "amount"
            },
            {
                "type": "int256",
                "name": "market_id"
            }
        ]
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "market"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "sender"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "type"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "price"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "amount"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "tradeid"
            }
        ],
        "type": "event",
        "name": "log_add_tx(int256,int256,int256,int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "market"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "sender"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "price"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "amount"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "tradeid"
            }
        ],
        "type": "event",
        "name": "log_cancel(int256,int256,int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "market"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "sender"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "amount"
            }
        ],
        "type": "event",
        "name": "log_deposit(int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "market"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "sender"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "owner"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "type"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "price"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "amount"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "tradeid"
            }
        ],
        "type": "event",
        "name": "log_fill_tx(int256,int256,int256,int256,int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": false,
                "type": "int256",
                "name": "id"
            }
        ],
        "type": "event",
        "name": "log_market(int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "market"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "type"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "price"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "amount"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "timestamp"
            }
        ],
        "type": "event",
        "name": "log_price(int256,int256,int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "market"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "sender"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "amount"
            }
        ],
        "type": "event",
        "name": "log_withdraw(int256,int256,int256)"
    }
];
