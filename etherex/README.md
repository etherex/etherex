EtherEx
=======

Decentralized exchange built on Ethereum.


About
-----

This repository contains the code that runs the exchange on Ethereum as a set of contracts, along with the UI, tests, tools and documentation.


Components
----------

* contracts: Ethereum contracts (serpent)
* frontend: React.js UI [repo](https://github.com/facebook/react)
* tests: EtherEx tests


Requirements
------------
* serpent: Serpent compiler by Vitalik Buterin [repo](https://github.com/ethereum/serpent)
* pyethereum: Python Ethereum client [repo](https://github.com/ethereum/pyethereum) (testing only)
* [EPM](https://github.com/project-douglas/epm) for deployment
* [npm](http://nodejs.org/) and [grunt](http://gruntjs.com/) for UI development


Installation
------------

Start by cloning this repository.

```
git clone https://github.com/etherex/etherex.git
```

### Testing
```
pip install --upgrade -r requirements.txt
```

### UI
```
cd frontend && npm install
```


Running tests
-------------
```
./runtests.py
```

Refer to [Serpent](https://github.com/ethereum/serpent) and [pyethereum.tester](https://github.com/ethereum/pyethereum) for their respective usage.


Local blockchain tests
----------------------
Requires a working [cpp-ethereum](https://github.com/ethereum/cpp-ethereum) client and [EPM](https://github.com/project-douglas/epm)

```
epm deploy contracts/EtherEx.package-definition
```

Then run the UI:
```
grunt
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
<operation> <minimum trade> <price precision> <currency> <contract>
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
7 1000000000000000000000 100000000 "BOB" 0xe559de5527492bcb42ec68d07df0742a98ec3f1e
```


### Subcurrency API

The current implementation uses a `<to> <value>` API for users and `<from> <to> <value>` for the exchange. This is subject to change shortly. There is also the [Metacoin API][5] to consider for support, compatibility or simply convenience. Other features will need to extend any core API for subcurrencies.


Notes
-----
* Your Ethereum address is used as your identity


TODO
----

### Architecture

* Link price indexes to orderbook and check for lower/higher bids (use head.se?)
* Remove array values instead of setting them to 0, maybe combine first and second indexes of arrays then (what?)
* ~~Combine/optimize buy/sell operations in while loop~~
* ~~Make ETX/ETH transactions~~
* Trigger BTC transactions
* Fees (?)
* Per user address storage, possible conflicts with price indexes
* Pending queue for deposits/withdrawals
* Deposit/withdrawal confirmation handling
* A few dozen other tests
* ... and then some

### UX/UI

* Mockups / wireframes
* Design elements
* ~~Choose JS framework~~
* Quick port of current functionality to new framework (in progress)
* Plan next structure and implementation (in progress)
* Implement said new structure
* Apply design elements


## License

Released under the MIT License, see LICENSE file.
