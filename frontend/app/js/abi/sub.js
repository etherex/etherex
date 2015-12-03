module.exports = [
    {
        "constant": false,
        "type": "function",
        "name": "allowance(int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "_address"
            },
            {
                "type": "int256",
                "name": "_spender"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "approve(int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "_spender"
            },
            {
                "type": "int256",
                "name": "_value"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "balance()",
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
        "name": "balanceOf(int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "_address"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "transfer(int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "_to"
            },
            {
                "type": "int256",
                "name": "_value"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "transferFrom(int256,int256,int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "_from"
            },
            {
                "type": "int256",
                "name": "_to"
            },
            {
                "type": "int256",
                "name": "_value"
            }
        ]
    },
    {
        "constant": false,
        "type": "function",
        "name": "unapprove(int256)",
        "outputs": [
            {
                "type": "int256",
                "name": "out"
            }
        ],
        "inputs": [
            {
                "type": "int256",
                "name": "_spender"
            }
        ]
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "_owner"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "_spender"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "_value"
            }
        ],
        "type": "event",
        "name": "Approved(int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "_from"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "_to"
            },
            {
                "indexed": false,
                "type": "int256",
                "name": "_value"
            }
        ],
        "type": "event",
        "name": "Transfer(int256,int256,int256)"
    },
    {
        "inputs": [
            {
                "indexed": true,
                "type": "int256",
                "name": "_owner"
            },
            {
                "indexed": true,
                "type": "int256",
                "name": "_spender"
            }
        ],
        "type": "event",
        "name": "Unapproved(int256,int256)"
    }
];
