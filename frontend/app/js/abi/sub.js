module.exports = [{
    "name": "balance(int256)",
    "type": "function",
    "inputs": [{ "name": "address", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "change_ownership(int256)",
    "type": "function",
    "inputs": [{ "name": "new_owner", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "set_exchange(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "addr", "type": "int256" }, { "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "transfer(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "recipient", "type": "int256" }, { "name": "amount", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
}];
