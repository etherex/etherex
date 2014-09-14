EtherEx
=======

Decentralized exchange built on Ethereum.


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
* [cpp-ethereum](https://github.com/ethereum/cpp-ethereum) browser (AlethZero or Third) by Gavin Wood
* [go-ethereum](https://github.com/ethereum/go-ethereum) (alternative browser) by Jeffrey Wilcke
* [pyethereum](https://github.com/ethereum/pyethereum) Python Ethereum client (tests only)
* [EPM](https://github.com/project-douglas/epm) for deployment
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
pip install --upgrade -r requirements.txt
```

#### Running tests

```
./runtests.py
```

Refer to [Serpent](https://github.com/ethereum/serpent) and [pyethereum](https://github.com/ethereum/pyethereum) for their respective usage.


### UI development

You will need a working node.js setup ([instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)) and globally installed `grunt-cli` ([instructions](http://gruntjs.com/getting-started)).

```
cd frontend
npm install
grunt
```


### Deployment

Requires a working [cpp-ethereum](https://github.com/ethereum/cpp-ethereum) client, [Serpent](https://github.com/ethereum/serpent) and [EPM](https://github.com/project-douglas/epm)

```
epm deploy contracts/EtherEx.package-definition
```


API
---

* Provisional API as more features are being moved to the interface.
* The API is the format of the data field for the Ethereum transactions.
* Subcurrency API is incomplete.
* You only need an Ethereum client to use the API.


## Trade API

### Add buy / sell trade
```
<operation> <amount> <price> <marketid>
```


### Trade
```
<operation> <tradeid[s]>
```


### Deposits / Withdrawals
```
<operation> <amount> <currency>
```


### Cancellations
```
<operation> <id>
```


### Adding a market
```
<operation> <minimum trade> <price precision> <currency> <contract> <decimal precision>
```


### Operations

Allowed values:
```
1 = BUY
2 = SELL
3 = TRADE
4 = DEPOSIT
5 = WITHDRAW
6 = CANCEL
7 = ADDMARKET
```


### Amounts

* Amount in wei for ETH or ETX
* Amount in satoshi for XBTC
* Lowest denomination of each subcurrency


### Prices

* Price in ETH/ETX * 10 ^ 8
* Price in ETH/XBTC * 10 ^ 8


### Market IDs
```
1 = ETX/ETH
```
New market IDs will be created as DAO creators add their subcurrency to the exchange.


### Currencies
```
0 = ETH
1 = ETX
2 = XBTC
...
```
New currency IDs will also be created as markets get added.


### Market names
Market names follow the "<name>/ETH" convention. When registering a new market, submit the currency name as a three or four letter uppercase identifier, ex.: "BOB" for BobCoin.


### Minimum trade amounts
When adding a subcurrency, set the minimum trade amount high enough to make economic sense. A minimum of 10 ETH (1000000000000000000000 wei) is recommended.


### Examples

Buy 1000 ETX at 1200 ETX/ETH
```
1 1000000000000000000000 120000000000 1
```

Sell 1000 ETX at 1500 ETX/ETH
```
2 1000000000000000000000 150000000000 1
```

Fulfill trade(s)
```
3 0x3039 0x2f58 ...
```

Deposit 1 XBTC
```
4 100000000 2
```

Withdraw 1 ETH
```
5 1000000000000000000 1
```

Cancel operation
```
6 0x3039
```

Add your subcurrency
```
7 1000000000000000000000 100000000 "BOB" 0xe559de5527492bcb42ec68d07df0742a98ec3f1e 4
```


### Subcurrency API

The current implementation uses a `<to> <value>` API for users and `<from> <to> <value>` for the exchange. This is subject to change shortly. There is also the [Metacoin API][5] to consider for support, compatibility or simply convenience. Other features will need to extend any core API for subcurrencies.


Notes
-----
* Your Ethereum address is used as your identity


TODO
----

### Architecture

* ~~Rename `currencies.se` to `markets.se`~~
* ~~Linked list contracts for `trades.se` and `markets.se`~~
* ~~Make sure / fix linked list's last/next are set properly (ie. removing first and only trade)~~
* Actually use `balances.se` to keep track of each address' balance within the exchange
* Link price indexes to orderbook and check for lower/higher bids (use heap.se?)
* Record last fulfilled trade's price in `markets.se`
* Support partial fills
* Implement subcurrency decimal precision (in progress)
* Implement proper price precision also
* Use scientific notation for big sub amounts (?)
* Assign a trade ID instead of using only slot #, match both for a valid trade
* Make sure trades are mined before allowing them to get filled... (obvious HFT prevention)
* Deposit/withdrawal queues and confirmation handling (?)
* ~~Go back to TDD~~ when serpent/pyethereum are usable
* Port contracts to [Solidity](https://github.com/ethereum/cpp-ethereum/wiki/ABI-in-PoC-7)
* Look into how [Whisper](https://github.com/ethereum/cpp-ethereum/wiki/Whisper) and [Swarm](https://github.com/ethereum/cpp-ethereum/wiki/Swarm) should be used and integrated
* Start working on X-Chain
* Update this TODO more frequently
* Start using GitHub issues instead
* Better, rock solid tests, and way more of them

### UX/UI

* ~~Port current implementation to new framework~~
* Split buy/sell forms
* Implement the live updating "which trade gets filled" while changing amount/price/total
* Handle and color code new/pending/mined trades
* Advanced trading features (limit vs market orders, etc.)
* Animations/transitions
* More/new mockups / wireframes
* More/new design elements
* Implement new mockups / design elements

### ETX/EETX

* Draft and start implementing the ETX subcurrency
* Discuss and decide how EETX should work and be managed
* Discuss and decide if another DAO should be used to manage EETX
* Begin work on the EETX contract(s) and UI otherwise


## License

Released under the MIT License, see LICENSE file.
