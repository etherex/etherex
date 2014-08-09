EtherEx
=======

Decentralized exchange built on Ethereum.


About
-----

This repository contains the code that runs the exchange on Ethereum as a set of contracts, along with tests, simulations, tools and documentation.


Components
----------

* contracts: Serpent contracts
* simulations: Python simulations (deprecated soon)
* serpent: Serpent compiler by Vitalik Buterin [repo](https://github.com/ethereum/serpent)
* pyethereum: Python Ethereum client [repo](https://github.com/ethereum/pyethereum)
* evm-sim: EVM simulator by Joris Bontje [repo](https://github.com/EtherCasts/evm-sim)
* ~~cll-sim: CLL simulator by Joris Bontje [repo](https://github.com/jorisbontje/cll-sim)~~
* tests: EtherEx evm-sim tests


Requirements
------------
* Python
* [EPM](https://github.com/project-douglas/epm) for deployment


Installation
------------
```
git clone https://github.com/etherex-crypto/etherex.git
cd etherex && pip install --upgrade -r requirements.txt
```

Then follow your platform specific instructions.

### Linux
```
cd serpent && make
sudo make install
```

### OS X
```
brew tap caktux/ethereum
brew install serpent
```


Running tests
-------------
```
./runtests.py
```

Refer to [Serpent](https://github.com/ethereum/serpent) and the [simulator](https://github.com/EtherCasts/evm-sim) for their respective usage.


Local Blockchain tests
----------------------
```
./etherex_init.py
```


API
---
* The API is the format of the data field for the Ethereum transactions.
* You only need an Ethereum client to use the API.

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
<operation> <name> <minimum trade> <owner[s]>
```

### Operations
Allowed values:
```
1 = Buy
2 = Sell
3 = Trade
4 = Deposit
5 = Withdraw
6 = Cancel
7 = Add market
```

### Amounts
* Amount in wei for ETH or XETH
* Amount in satoshi for BTC
* Smallest denomination for other amounts (see future shared protocol)

### Prices
* Price in ETH/BTC * 10 ^ 8, as integer
* Price in ETH/XETH * 10 ^ 8, as integer

### Market IDs
Allowed values
```
1 = ETH/BTC
2 = ETH/XETH
...
```

### Currencies
```
0 = ETH
1 = XETH
2 = XBTC
...
```

### Market names
Follow the "ETH/<name>" convention for the market name, like "ETH/BOB" for BobCoin.

### Minimum trade amounts
When adding a subcurrency, make the minimum trade amount high enough to make economic sense.

### Examples
Buy 1000 ETH at 1200 ETH/BTC (for 1.2 BTC)
```
1 1000000000000000000000 120000000000 1
```

Sell 1000 ETH at 1200 ETH/BTC (for 1.2 BTC)
```
2 1000000000000000000000 120000000000 1
```

Fulfill trade
```
3 0x3039
```

Deposit 1 BTC
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
7 1000000000000000000000 100000000 "ETH/BOB" 0xe559de5527492bcb42ec68d07df0742a98ec3f1e
```


Notes
-----
* Your Ethereum address is used as your identity
* You can only make trades for your address


TODO
----
* Link price indexes to orderbook and check for lower/higher bids
* Remove array values instead of setting them to 0, maybe combine first and second indexes of arrays then
* Combine/optimize buy/sell operations in while loop
* Make ETH/XETH transactions
* Trigger BTC transactions
* Fees
* Per user address storage, possible conflicts with price indexes
* Pending queue for deposits/withdrawals
* Deposit/withdrawal confirmation handling
* GGF
* Thousands more tests
* ... and then some


## License

Released under the MIT License.
