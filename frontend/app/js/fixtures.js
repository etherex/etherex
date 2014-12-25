var ether = "1000000000000000000";
var tenEther = "10000000000000000000";
var precision = "100000000";

var fixtures = {
    ether: ether,
    tenEther: tenEther,
    precision: precision,
    addresses: {
        nameregs: ["0x72ba7d8e73fe8eb666ea66babc8116a41bfb10e2", "0xcd91d7a2eeb6e23b30ec6e501e3ffd5688c3104e"],
        etherex: "0xf298931b974dfb01b13e44eae9e4428afa3ba7f4"
    },
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
                    "name": "a",
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
                    "name": "a",
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
                    "name": "a",
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
                    "name": "a",
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
                    "name": "a",
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
                    "name": "a",
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
            "name": "change_ownership",
            "inputs": [
                {
                    "name": "a",
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
                },
                {
                    "name": "last_price",
                    "type": "uint256"
                },
                {
                    "name": "owner",
                    "type": "uint256"
                },
                {
                    "name": "block",
                    "type": "uint256"
                }
            ]
        },
    ]
};

module.exports = fixtures;
