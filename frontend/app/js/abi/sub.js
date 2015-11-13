module.exports = [{
    "name": "approve(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "approveOnce(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }, { "name": "_maxValue", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "balance(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "balanceOf(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "unapprove(int256)",
    "type": "function",
    "inputs": [{ "name": "_addr", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "isApproved(int256)",
    "type": "function",
    "inputs": [{ "name": "_proxy", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "isApprovedFor(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_target", "type": "int256" }, { "name": "_proxy", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "isApprovedOnce(int256)",
    "type": "function",
    "inputs": [{ "name": "_proxy", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "isApprovedOnceFor(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_target", "type": "int256" }, { "name": "_proxy", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "transfer(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_to", "type": "int256" }, { "name": "_value", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "transferFrom(int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "_from", "type": "int256" }, { "name": "_to", "type": "int256" }, { "name": "_value", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "AddressApproval(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "address", "type": "int256", "indexed": true }, { "name": "proxy", "type": "int256", "indexed": true }, { "name": "result", "type": "int256", "indexed": false }]
},
{
    "name": "AddressApprovalOnce(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "address", "type": "int256", "indexed": true }, { "name": "proxy", "type": "int256", "indexed": true }, { "name": "value", "type": "int256", "indexed": false }]
},
{
    "name": "Transfer(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "from", "type": "int256", "indexed": true }, { "name": "to", "type": "int256", "indexed": true }, { "name": "value", "type": "int256", "indexed": false }]
}];
