EtherEx
=======

Decentralized exchange built on Ethereum.


About
-----

This repository contains the code that runs the exchange on Ethereum as a set of contracts, along with tests, simulations, tools and documentation.


Components
----------

* contracts: CLL contracts running EtherEx
* simulations: Python simulations for EtherEx
* compiler: Python compiler by Vitalik Buterin [repo](https://github.com/ethereum/compiler)
* cll-sim: CLL simulator by Joris Bontje [repo](https://github.com/jorisbontje/cll-sim)
* tests: extra tests


Running tests
-------------
```
./runtests.py
```

Refer to the [compiler](https://github.com/ethereum/compiler) and [simulator](https://github.com/jorisbontje/cll-sim) for their respective usage.


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

### Operations
Allowed values:
```
1 = BUY
2 = SELL
3 = DEPOSIT
4 = WITHDRAW
5 = CANCEL
```

### Amounts
* Amount in wei for ETH or XETH
* Amount in satoshi for BTC

### Prices
* Price in ETH/BTC * 10 ^ 8, as integer
* Price in ETH/XETH * 10 ^ 8, as integer

### Market IDs
Allowed values
```
1 = ETH/BTC
2 = ETH/XETH
```

### Currencies
```
1 = ETH
2 = BTC
3 = XETH
```

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


Notes
-----
* Your Ethereum address is used as your identity
* You can only make trades for your address
* Balances can't be transferred


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
