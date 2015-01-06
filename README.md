EtherEx
=======

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
* [cpp-ethereum](https://github.com/ethereum/cpp-ethereum) node by Gavin Wood
* [go-ethereum](https://github.com/ethereum/go-ethereum) browser by Jeffrey Wilcke
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

Requires a working [cpp-ethereum](https://github.com/ethereum/cpp-ethereum) client with JSONRPC, [Serpent](https://github.com/ethereum/serpent) and [PyEPM](https://github.com/etherex/pyepm)

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

Function IDs:
```
0x00 = PRICE
0x01 = BUY
0x02 = SELL
0x03 = TRADE
0x04 = DEPOSIT
0x05 = WITHDRAW
0x06 = CANCEL
0x07 = ADD_MARKET
0x08 = GET_MARKET
0x09 = GET_TRADE_IDS
0x0a = GET_TRADE
0x0b = GET_SUB_BALANCE
0x0c = CHANGE_OWNERSHIP
0x0d = NAME_REGISTER
0x0e = NAME_UNREGISTER
```


## Price API
```
<operation> <market_id>
```


## Trade API

### Add buy / sell trade
```
<operation> <amount> <price> <market ID>
```

### Trade
```
<operation> <trade ID>
```

### Deposit (subcurrency contracts only, [see below](#subcurrency-api))
```
<operation> <address> <amount> <market ID>
```

### Withdraw
```
<operation> <amount> <market ID>
```

### Cancellations
```
<operation> <trade ID>
```


### Adding a market
```
<operation> <currency name> <contract address> <decimal precision> <price denominator> <minimum total>
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


#### Market IDs
```
1 = ETX/ETH
```
New market IDs will be created as DAO creators add their subcurrency to the exchange.


### Examples

Buy 1000 ETX at 1200 ETX/ETH
```
0x01 1000000000000000000000 120000000000 1
```

Sell 1000 ETX at 1500 ETX/ETH
```
0x02 1000000000000000000000 150000000000 1
```

Fulfill trade
```
0x03 0x3039...
```

Deposit 1 ETX (from subcurrency contracts only, [see below](#subcurrency-api))
```
0x04 0xe559de5527492bcb42ec68d07df0742a98ec3f1e 100000000 1
```

Withdraw 1 ETX
```
0x05 100000000 1
```

Cancel operation
```
0x06 0x3039...
```

Add your subcurrency
```
7 "BOB" 0xe559de5527492bcb42ec68d07df0742a98ec3f1e 4 100000000 1000000000000000000000
```


### Subcurrency API

**Subcurrency contracts need to support the `deposit` ABI call.**

It is a different approach than the [MetaCoin API](https://github.com/ethereum/cpp-ethereum/wiki/MetaCoin-API) which will not be used, as the `Approve API` is all-or-nothing and gives too much permissions to the exchange. The new procedure is explained below, and the sample [ETX](https://github.com/etherex/etherex/blob/master/contracts/etx.se) contract can be used as an example.

Each subcurrency has to **notify** the exchange of each asset transfer from a user's address to the exchange's address. The amount of extra code necessary to support this feature is comparable if not smaller than with the other approach.

#### Setting the exchange's address

The first step a subcurrency has to take is to store the exchange's address for future comparison of recipients. This can be done during the initialization of the contract, however, adding an ABI call to update the address and `market_id` is highly recommended.

```
data owner
data exchange
data market_id

def init():
    self.owner = msg.sender
...

def set_exchange(addr, market_id):
    if msg.sender == self.owner:
        self.exchange = addr
        self.market_id = market_id
        return(1)
    return(0)
```

After registering the subcurrency using the `ADD_MARKET` ABI call, the subcurrency will receive a `market_id`. Since there are currently no return values to actual transactions, this `market_id` will need to be inspected from the exchange's contract storage or from the UI.

#### Notifying the exchange of deposits

The second step has to be executed on each asset transfer. The gas costs of comparing the recipient to the exchange's address are minimal but a separate ABI call might be used later on, depending on how this approach will play out on the testnet. The relevant part below is the one under `Notify exchange of deposit`, the top part being what can be considered standard subcurrency functionality. Notice the `extern` definition that will be used to determine the `deposit` function ID.

```
extern exchange: [price, buy, sell, trade, deposit, withdraw]

def send(recipient, amount):
    # Get user balance
    balance = self.storage[msg.sender]

    # Make sure balance is above or equal to amount
    if balance >= amount:

        # Update balances
        self.storage[msg.sender] = balance - amount
        self.storage[recipient] += amount

        # Notify exchange of deposit
        if recipient == self.exchange:
            ret = self.exchange.deposit(msg.sender, amount, self.market_id, datasz=3, as=exchange)
            # Exchange returns the amount as confirmation
            if ret == amount:
                return(1)
            # We return 2 as error code for notification failure
            else:
                return(2)

        return(1)
    return(0)
```

**TODO**: Solidity examples.


Notes
-----
* Your Ethereum address is used as your identity


TODO
----

### Architecture

* Link price indexes to orderbook and check for lower/higher bids (use heap.se?)
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

* Handle and color code new/pending/mined trades
* Graphs, beautiful graphs
* Advanced trading features (limit vs market orders, stoploss, etc.)
* Animations/transitions
* Check/clear buttons
* Wallet design and theming
* More/new mockups / wireframes
* More/new design elements
* Implement new mockups / design elements


## License

Released under the MIT License, see LICENSE file.
