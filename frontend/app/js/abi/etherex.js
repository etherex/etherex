module.exports = [{
    "name": "add_market(int256,int256,int256,int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "name", "type": "int256" }, { "name": "contract", "type": "int256" }, { "name": "decimals", "type": "int256" }, { "name": "precision", "type": "int256" }, { "name": "minimum", "type": "int256" }, { "name": "category", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "buy(int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "amount", "type": "int256" }, { "name": "price", "type": "int256" }, { "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "cancel(int256)",
    "type": "function",
    "inputs": [{ "name": "trade_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "deposit(int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "address", "type": "int256" }, { "name": "amount", "type": "int256" }, { "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "get_last_market_id()",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "get_market(int256)",
    "type": "function",
    "inputs": [{ "name": "id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256[]" }]
},
{
    "name": "get_sub_balance(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "address", "type": "int256" }, { "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256[]" }]
},
{
    "name": "get_trade(int256)",
    "type": "function",
    "inputs": [{ "name": "id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256[]" }]
},
{
    "name": "get_trade_ids(int256)",
    "type": "function",
    "inputs": [{ "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256[]" }]
},
{
    "name": "price(int256)",
    "type": "function",
    "inputs": [{ "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "sell(int256,int256,int256)",
    "type": "function",
    "inputs": [{ "name": "amount", "type": "int256" }, { "name": "price", "type": "int256" }, { "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "trade(int256,int256[])",
    "type": "function",
    "inputs": [{ "name": "max_amount", "type": "int256" }, { "name": "trade_ids", "type": "int256[]" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "withdraw(int256,int256)",
    "type": "function",
    "inputs": [{ "name": "amount", "type": "int256" }, { "name": "market_id", "type": "int256" }],
    "outputs": [{ "name": "out", "type": "int256" }]
},
{
    "name": "log_add_tx(int256,int256,int256,int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "market", "type": "int256", "indexed": true }, { "name": "sender", "type": "int256", "indexed": false }, { "name": "type", "type": "int256", "indexed": false }, { "name": "price", "type": "int256", "indexed": false }, { "name": "amount", "type": "int256", "indexed": false }, { "name": "tradeid", "type": "int256", "indexed": false }]
},
{
    "name": "log_cancel(int256,int256,int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "market", "type": "int256", "indexed": true }, { "name": "sender", "type": "int256", "indexed": false }, { "name": "price", "type": "int256", "indexed": false }, { "name": "amount", "type": "int256", "indexed": false }, { "name": "tradeid", "type": "int256", "indexed": false }]
},
{
    "name": "log_deposit(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "market", "type": "int256", "indexed": true }, { "name": "sender", "type": "int256", "indexed": true }, { "name": "amount", "type": "int256", "indexed": false }]
},
{
    "name": "log_fill_tx(int256,int256,int256,int256,int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "market", "type": "int256", "indexed": true }, { "name": "sender", "type": "int256", "indexed": true }, { "name": "owner", "type": "int256", "indexed": true }, { "name": "type", "type": "int256", "indexed": false }, { "name": "price", "type": "int256", "indexed": false }, { "name": "amount", "type": "int256", "indexed": false }, { "name": "tradeid", "type": "int256", "indexed": false }]
},
{
    "name": "log_market(int256)",
    "type": "event",
    "inputs": [{ "name": "id", "type": "int256", "indexed": false }]
},
{
    "name": "log_price(int256,int256,int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "market", "type": "int256", "indexed": true }, { "name": "type", "type": "int256", "indexed": false }, { "name": "price", "type": "int256", "indexed": false }, { "name": "amount", "type": "int256", "indexed": false }, { "name": "timestamp", "type": "int256", "indexed": false }]
},
{
    "name": "log_withdraw(int256,int256,int256)",
    "type": "event",
    "inputs": [{ "name": "market", "type": "int256", "indexed": true }, { "name": "sender", "type": "int256", "indexed": true }, { "name": "amount", "type": "int256", "indexed": false }]
}];
