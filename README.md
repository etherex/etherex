EtherEx
=======
[![Build Status](https://travis-ci.org/etherex/etherex.svg?branch=master)](https://travis-ci.org/etherex/etherex) [![SlackIn](http://slack.etherex.org/badge.svg)](http://slack.etherex.org) [![Join the chat at https://gitter.im/etherex/etherex](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/etherex/etherex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Decentralized exchange built on Ethereum.

<img src="/frontend/screenshot.png" />

About
-----

This repository contains the source code that runs the exchange on Ethereum as a set of contracts, along with the UI, tests, tools and documentation.


Components
----------

* contracts: Ethereum contracts in [Serpent](https://github.com/ethereum/serpent)
* frontend: [React.js](https://github.com/facebook/react) UI
* tests: EtherEx tests


Requirements
------------
* [Serpent](https://github.com/ethereum/serpent) compiler by Vitalik Buterin
* [cpp-ethereum](https://github.com/ethereum/cpp-ethereum) client by Gavin Wood
* [go-ethereum](https://github.com/ethereum/go-ethereum) client by Jeffrey Wilcke
* [pyethereum](https://github.com/ethereum/pyethereum) Python Ethereum client (tests only)
* [PyEPM](https://github.com/etherex/pyepm) for deployment
* [node](http://nodejs.org/) and [grunt](http://gruntjs.com/) for UI development


Installation
------------

Start by cloning this repository.

```
git clone https://github.com/etherex/etherex.git
```


### Development / testing

This will install `pyethereum` and `ethereum-serpent` if you don't already have those installed.

```
pip install -r dev_requirements.txt
```

#### Running tests

```
py.test -vvrs
```

Refer to [Serpent](https://github.com/ethereum/serpent) and [pyethereum](https://github.com/ethereum/pyethereum) for their respective usage.


### UI development

You will need a working node.js setup ([instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)) and globally installed `grunt-cli` ([instructions](http://gruntjs.com/getting-started)).

```
cd frontend
npm install
grunt
```

And open `http://localhost:8089/` in your browser.

### Deployment

Requires a local client (Go or C++) with JSONRPC, [Serpent](https://github.com/ethereum/serpent) and [PyEPM](https://github.com/etherex/pyepm)

```
cd contracts
pyepm EtherEx.yaml
```


API
---

* The API is the format of the data field for the Ethereum transactions.
* Subcurrencies need to support the [Subcurrency API](#subcurrency-api).
* You only need an Ethereum client to use the API.


## Operations

Methods (with serpent type definitions):
```
[
  price:[int256]:int256,
  buy:[int256,int256,int256]:int256,
  sell:[int256,int256,int256]:int256,
  trade:[int256,int256[]]:int256,
  cancel:[int256]:int256,
  deposit:[int256,int256]:int256,
  withdraw:[int256,int256]:int256,
  add_market:[int256,int256,int256,int256,int256,int256]:int256,
  get_market_id:[int256]:int256,
  get_last_market_id:[]:int256,
  get_market:[int256]:int256[],
  get_trade:[int256]:int256[],
  get_trade_ids:[int256]:int256[],
  get_sub_balance:[int256,int256]:int256[]
]
```


## Price API
```
price(market_id)
```


## Trade API

### Add buy / sell trade
```
buy(amount, price, market_id)
sell(amount, price, market_id)
```

### Trade
```
trade(max_amount, trade_ids)
```

### Deposit
```
deposit(amount, market_id)
```

### Withdraw
```
withdraw(amount, market_id)
```

### Cancel trade
```
cancel(trade_id)
```

### Adding a market
```
add_market(currency_name, contract_address, decimal_precision, price_denominator, minimum_total, category)
```

### Getting a market's ID
```
get_market_id(contract_address)
```

#### Market names

Market names follow the "<currency name>/ETH" convention. When registering a new market, submit the currency name as a three or four letter uppercase identifier, ex.: "BOB" for BobCoin.

#### Contract address

The subcurrency contract address.

#### Decimal precision

The subcurrency's decimal precision as an integer.

#### Price denominator

* Denominator for price precision, ex. 10000 (10000 => 1 / 10000 => 0.0001)

#### Minimum trade total
When adding a subcurrency, set the minimum trade total high enough to make economic sense. A minimum of 10 ETH (1000000000000000000000 wei) is recommended.

#### Categories
```
1 = Subcurrencies
2 = Crypto-currencies
3 = Real-world assets
4 = Fiat currencies
```
EtherEx allows you to categorize your subcurrency into four main categories. Since everything is represented as subcurrencies, those categories are simply for convenience. If you have a DApp that has its own token, that would go in the regular subcurrency section `1`. If your token represents a fiat currency redeemable at a gateway, add it to `4`. If your token represents a real-world asset like gold or a car, add it to `3`. For other crypto-currencies like BTC, also redeemable at a gateway, add it to `2`.

#### Market IDs
```
1 = ETX/ETH
```
New market IDs will be created as DAO creators add their subcurrency to the exchange.


### Subcurrency API

**Subcurrency contracts need to support the [Standardized Contract APIs](https://github.com/ethereum/wiki/wiki/Standardized_Contract_APIs), more specifically the `approveOnce` and `sendCoinFrom` methods for deposits, the `sendCoin` method for withdrawals and the `coinBalanceOf` method for the UI to display the user's balance.**

See the example [ETX](https://github.com/etherex/etherex/blob/master/contracts/etx.se) contract for a Serpent implementation, or a [Standard Token](https://github.com/simondlr/Contract-Reactor/blob/master/example/app/contracts/Standard_Token.sol) in Solidity.

After registering the subcurrency using the `add_market` ABI call, the subcurrency will receive a `market_id`. You can retrieve the market ID with a call to `get_market_id(contract_address)`.

#### Deposit support
**IMPORTANT: The original `deposit` technique has been deprecated in favor of the [Standardized Contract APIs](https://github.com/ethereum/wiki/wiki/Standardized_Contract_APIs)**

To support deposits to EtherEx, your subcurrency needs to implement the `approveOnce` and `sendCoinFrom` methods. The former allows a one-time transfer from the user's address by the exchange's contract, while the latter is called from the contract to effectively make that transfer when the user calls the exchange's new `deposit` method. This allows to securely send a subcurrency's tokens to the exchange's contract while updating the user's available balance at the exchange.

#### Withdrawal support

If your subcurrency's default method for transferring funds is also named `sendCoin` like the standard examples above, with the `_value` and `_to` parameters (in that order), then there is nothing else you need to do to support withdrawals from EtherEx to a user's address. Otherwise, you'll need to implement that same `sendCoin` method with those two parameters, and "translate" that method call to yours, calling your other method with those parameters, in the order they're expected. You may also have to use `tx.origin` instead of `msg.sender` in your method as the latter will return your contract's address.

```
def sendCoin(_value, _to):
    return(self.invertedtransfer(_to, _value))
```

#### Balance

Subcurrency contracts also need to implement a `coinBalanceOf` method for the UI to display the user's balance in that contract (also called the subcurrency's wallet).

```
def coinBalanceOf(_addr):
    return(self.balances[_addr].balance)
```


Accounts
-----
* Your Ethereum address is used as your identity


TODO
----

### Architecture

* Document error codes of return values
* Implement Wallet section (transactions, balances, etc.) (in progress)
* Re-implement NameReg support and integration
* Start the Tools section, find and list ideas
    - subcurrency registration (in progress)
    - subcurrency creation tools/wizard
    - raw transact (?)
    - trading tools (...)
    - ...
* Use [NatSpec](https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format)
* Look into how [Whisper](https://github.com/ethereum/wiki/wiki/Whisper-Overview) and [Swarm](https://github.com/ethereum/cpp-ethereum/wiki/Swarm) could be used and integrated
* Start working on X-Chain
* Update this TODO more frequently
* Start using GitHub issues instead
* Better, rock solid tests, and way more of them
* Total unilateral world takeover

### UX/UI

* Graphs, beautiful graphs
* Advanced trading features (stoploss, etc.)
* Animations/transitions
* Check/clear buttons
* Wallet design and theming
* More/new mockups / wireframes
* More/new design elements
* Implement new mockups / design elements


## License

Released under the MIT License, see LICENSE file.
