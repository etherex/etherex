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
* evm-sim: EVM simulator by Joris Bontje [repo](https://github.com/EtherCasts/evm-sim)
* cll-sim: HLL simulator by Joris Bontje [repo](https://github.com/jorisbontje/cll-sim)
* tests: evm-sim tests


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


Requirements
------------
```
pip install -r requirements.txt
```


API
---
* The API is the format of the data field for the Ethereum transactions.
* You only need an Ethereum client to use the API.

### Trades (buy / sell)
```
<operation> <amount> <price> <marketid>
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
3 = Deposit
4 = Withdraw
5 = Cancel
6 = Add market (subcurrency)
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
1 = ETH
2 = BTC
3 = XETH
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

Deposit 1 BTC
```
3 100000000 2
```

Withdraw 1 ETH
```
4 1000000000000000000 1
```

Cancel operation
```
5 12345678901234567890
```

Add your subcurrency
```
6 "ETH/BOB" 100000000
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
