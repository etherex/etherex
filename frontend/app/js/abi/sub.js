module.exports = [{
    "name": "approveOnce(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }, { "name": "_maxValue", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "change_ownership(int256)",
    "type": "function",
    "inputs": [{ "name": "new_owner", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "coinBalance(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "coinBalanceOf(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "isApprovedFor(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_target", "type": "int256" }, { "name": "_proxy", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "sendCoin(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_value", "type": "int256" }, { "name": "_to", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "sendCoinFrom(int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_from", "type": "int256" }, { "name": "_value", "type": "int256" }, { "name": "_to", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "unapprove(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "AddressApprovalOnce(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "from", "type": "int256", "indexed": true }, { "name": "to", "type": "int256", "indexed": true }, { "name": "value", "type": "int256", "indexed": false }]
},
{
    "name": "CoinTransfer(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "from", "type": "int256", "indexed": true }, { "name": "to", "type": "int256", "indexed": true }, { "name": "value", "type": "int256", "indexed": false }]
}];
