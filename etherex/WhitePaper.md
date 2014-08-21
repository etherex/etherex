A decentralized exchange built on Ethereum
===================================================

Abstract
--------

The world of finance has been thoroughly disrupted by the technology of the decentralized blockchain. This disruption, however, is incomplete; while cryptocurrencies have revolutionized the way wealth is transferred, one obstacle has been holding them back from their true potential. The problem lies in the current reliance on centralized exchanges.

The dustbin of crypto-history is filled with defunct exchanges that succumbed to poor security, mismanagement, or outright theft on the part of their owners. The victims of broken centralized exchanges have lost untold millions as a result. Broader adoption of the crypto ecosystem has been hampered as well; potential users, well-aware of the losses suffered by those victims, have chosen to stay firmly in the familiar world of fiat.

This White Paper lays the foundation for a better approach: a way forward that will bring an abrupt end to the phenomenon of getting “Goxxed”.

EtherEx is the world's first truly decentralized crypto exchange. Leveraging the power of Ethereum, it will empower users to exchange in a secure and trustless fashion, as well as trade in ways not possible with first-generation blockchain technologies.


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

  - [Concept](#concept)
    - [The decentralized, centralized order book](#the-decentralized-centralized-order-book)
  - [Requirements](#requirements)
  - [Problems and solutions](#problems-and-solutions)
    - [Blockchain bloat](#blockchain-bloat)
    - [Off-chain coins and fiat integration](#off-chain-coins-and-fiat-integration)
    - [Adoption and ecosystem](#adoption-and-ecosystem)
  - [Implementation of a decentralized exchange on Ethereum](#implementation-of-a-decentralized-exchange-on-ethereum)
  - [A New Approach](#a-new-approach)
  - [Data structure and API](#data-structure-and-api)
    - [API](#api)
    - [Trades (buy / sell)](#trades-buy--sell)
    - [Deposits / Withdrawals](#deposits--withdrawals)
    - [Cancellations](#cancellations)
    - [Adding a market](#adding-a-market)
    - [Operations](#operations)
    - [Amounts](#amounts)
    - [Prices](#prices)
    - [Market IDs](#market-ids)
    - [Currencies](#currencies)
    - [Market names](#market-names)
    - [Minimum trade amounts](#minimum-trade-amounts)
    - [Examples](#examples)
  - [Notes](#notes)
- [Interface](#interface)
    - [JSON API](#json-api)
- [Conclusion](#conclusion)
    - [References](#references)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


Concept
-------

EtherEx consists of many contracts running on Ethereum. These contracts interact with each other to allow users to make trades. In order to use the exchange, users enter trade information and send funds to a master contract. Once this master contract receives both sides of the trade, it executes and sends the funds to the respective parties involved.

A key distinction between EtherEx and traditional centralized exchanges is where the funds are held during a trade. In the latter case, users are forced to trust the exchange's owners to execute the trade in a fair and secure fashion. In the case of EtherEx, the contract - not the exchange - holds the funds. This contract takes the form of auditable code which lives on the Ethereum network. The result is that trades can be accomplished without having to trust neither the opposite party, nor the exchange.


Limitations of current implementations
--------------------------------------

The concept of a decentralized exchange can take many forms, and can be implemented in many different ways. A few projects have already emerged, including some that are already operational: namely Counterparty and Mastercoin's metaDEx. Both implement the concept in a peer-to-peer fashion and are built on top of the Bitcoin network. However, these exchanges are limited by the very nature of Bitcoin's blockchain technology. 

Bitcoin, at its core, is designed solely for secure peer-to-peer wealth transfer. It excels in this role; if Alice sends Bob 5 BTC, the distributed public ledger will show that Alice now has 5 less BTC and Bob has 5 more BTC. But while Bitcoin's public ledger allows the platform to thrive as a cryptocurrency, its singular focus also introduces major limitations.

Building a decentralized exchange on a ledger that was designed to keep track of simple transactions - unspent outputs in Bitcoin's jargon - is like trying to run Wall Street using side-notes in every accountant's single-lined book and matching traders by phone; it might be feasible, but it certainly wouldn't offer the best experience.

It's these limitations - along with those spelled out in the [Ethereum White Paper][1] - that make Ethereum a much better platform for a decentralized exchange.


### The decentralized (centralized) order book

In Ethereum, we now have a solid foundation on which to build a no-compromise decentralized exchange. The limitations of Bitcoin and its need for unelegant workarounds and hacks have been cast aside. In its place is a “crypto 2.0” protocol that is well-equipped with a powerful suite of programming and cryptographic tools.

But while effective tools are interesting on their own, they can't reach their true potential unless they allow us to connect more easily. (On this point, Bitcoin has wildly succeeded). Git, for example, is a highly effective decentralized tool that lacked the ability to gather code and achieve some level of centralization. GitHub solved this problem - all while providing transparency and inherent security.

Ethereum provides the perfect platform for transparency. We can centralize the order book, the trading engine, and every rule we need to make an exchange work - and we can do this in a way that is **fully transparent, 100% open-source, and with the market-proven security of blockchain technology**.

Traders will no longer have to trust private servers to hold the order book, along with every single one of its inputs and outputs. This new order book and the deterministic nature of contracts on Ethereum brings much-needed transparency to cryptocurrency exchanges.


Requirements
------------

* Fully operational Ethereum network
* Standard balance check API
* Off-chain interaction with other cryptocurrencies


Problems and solutions
----------------------

As described above, centralized exchanges suffer from a serious trust problem. A decentralized exchange solves this issue, but also poses challenges of its own. These include:


* Possible blockchain bloat
* Front-running
* Off-chain coins and fiat integration
* Adoption and ecosystem


Managing the integration of other cryptocurrencies is a challenging aspect of a decentralized exchange - and probably the main reason why none has emerged so far. Ethereum provides a solution to the security and decentralization, but also brings the necessary building blocks for other cryptocurrencies to start interacting. A decentralized exchange will be the first application of this kind to take advantage of these possibilities.

Outside of the Ethereum network, a decentralized exchange will need secure wallets and their related APIs to communicate information back into the trading engine. The first implementations for the Ether/Bitcoin (ETH/BTC) trading pair might require a more centralized approach depending on the tools available to secure off-chain coins. Seperate decisions will need to be made regarding other trading pairs, and easier and more direct implementations into the Ethereum network may also offer alternatives that will have to be considered when they arise.


### Blockchain bloat

Trading data will need to be regularly optimized in order to maintain an acceptable footprint on the Ethereum network. While further experimentation is needed, it's already clear that the operating costs will not be suited for high-frequency trading (HFT) and for very small trades. It will be the exchange's responsibility to be properly optimized both in its execution and storage use. However, other scaling issues will have to be resolved within the Ethereum platform itself, by its core development team and with the assistance of EtherEx and other Dapp developers.


### Front-running

By the very nature of blockchain technology, miners have an inherent possibility to hold back transactions proportional to their mining power within the network. While the consequences within Bitcoin are minimal (longer delays before a transaction gets included), the smart contracts within Ethereum are more vulnerable to manipulation depending on their behaviour regarding the order in which transactions are processed. Unless protocol level protections are implemented, a two-phase trading process will have to be used to prevent front-running. A process similar to [Frequent Batch Auctions][3] but adapted to the specifics of Ethereum could be a possible solution (see also [On Decentralizing Prediction Markets and Order Books][4]). Traders would submit sealed bids (commitments) to be ordered and processed in a later block while they're being reveiled.


### Off-chain coins and fiat integration

Ethereum will not be able to interact with off-chain assets such as Bitcoin and Litecoin without first having brought those off chain assets onto Ethereum. Since the ability to bring off-chain assets onto the Ethereum chain is not a feature built into the core of Ethereum, the exchange will have to implement this feature independently - all while staying true to its overarching goal of decentralization.

At this point a few different solutions offer themselves. 

It may be possible to use a combination of multi-signature wallets and oracles to create an environment where no one party has the ability to steal assets, or block them from moving. Another solution is to implement sidechains as a way to trustlessly handle these off chain assets. Unfortunately the Bitcoin technology is not in place to implement sidechains from their end - thus, this option will not be a viable one until the core Bitcoin technology is updated. (Though once it becomes a possibility, the sidechain approach might be the optimal way to implement off-chain assets.)

Fiat integration brings its own set of problems, as by nature fiat is not decentralized. If fiat existed on a blockchain, implementing it would be no different than adding any other off chain asset. Unfortunately, that is not the case.

One possible solution to this conundrum is the use of shelling coins to hold a steady value. While it may not technically be fiat, shelling coins could be pegged to a steady value such as the USD, EUR or even commodities such as oil and gold. Another possible solution for fiat integration is that a third party with the existing infrastructure may decide it is profitable to issue Ethereum USD coins. If an entity takes up the role of taking in fiat and issuing Ethereum coins representing that fiat, it could be implemented or even used directly on the exchange.


### Adoption and ecosystem

A decentralized exchange will require no sign-up of any kind from users to allow for its normal operations. However, users will be required to hold an initial balance of Ether to interact with the network in the first place. The exchange will play an important role within the ecosystem - for example, Vlad Zamfir describes the role of a “DAOex” in the (draft) paper The [DAOist protocol][2], and some work has already been done in that paper towards building a path toward easier adoption. Other elements of that protocol would need to be implemented by both the exchange and DAOs, and will be covered when a complete API is available if it is to be realized.

The adoption rate of the exchange will depend heavily on the adoption rate of Ethereum itself. Adoption may accelerate once the exchange offers an assortment of off-chain assets. If EtherEx can become a decentralized version of widely-used exchanges such as Cryptsy, many users may potentially switch over in a short amount of time. As the overall Ethereum infrastructure may take some time to be built out, trading between off-chain assets will be a likely catalyst that speeds up the exchange's adoption.

The ecosystem of subcurrencies and DApps within Ethereum will also have a major influence on the adoption rate of the exchange. Even if the trading of off-chain assets could be enough to make the exchange a "killer app" and provide a sufficiently high adoption rate, a thriving subcurrency market will be needed to prove the usefulness of both Ethereum and a decentralized exchange.


Implementation of a decentralized exchange on Ethereum
------------------------------------------------------

The decentralized exchange is comprised of a set of contracts running on the Ethereum blockchain. The EtherEx team has been running tests and simulations since the platform's first proof-of-concept (POC) was made available, and has already made a number of contributions to the codebase of Ethereum itself. Although very basic at the moment, these contributions were exactly what was needed to verify the feasibility of this project - a sort of "POC-within-a-POC."

Below is an even more simplistic example outlining some of the basic ideas of an exchange contract :

```python
init:
    contract.storage[2] = msg.sender # Set sender as owner
code:
    statusindex = 1
    ownerindex = 2
    buyindex = 3
    sellindex = 4
    status = contract.storage[statusindex]
    owner = contract.storage[ownerindex]
    if status == 0 and msg.sender == owner:
        if tx.value < 1 * 10 ^ 18: # Minimum 1 ETH to initialize
            return(0)
        contract.storage[statusindex] = 1
        return(1)
    else:
        if tx.value < 1 * 10 ^ 18: # Minimum 1 ETH for this example
            return(0)
        buyorsell = msg.data[0]
        availabletobuy = contract.storage[sellindex]
        if buyorsell == 1:
            if availabletobuy <= msg.value:
                return(0)
            contract.storage[sellindex] = availabletobuy - msg.value
            ret = send(500, msg.sender, 2 * msg.value)
            return(ret)
        elif buyorsell == 2:
            contract.storage[sellindex] = availabletobuy + msg.value
        return(1)
    return(0) # Should have returned something
```

You will notice how this is a one-way exchange and barely touches the surface of what's possible. Remember that this contract is for the sake of the example only. The actual contracts that will be used will be different in almost every way, but the same concepts will still apply.

Let's take a look at what this example would do.

First we define the different storage indexes that will be used, and then get the contract status from the contract's storage. We then proceed to check if the contract has been initialized, and if not, make sure the owner is funding the exchange with at least 1 ether. If that verification passes, the owner's address is written into the contract's storage at the specified index and the contract's status is changed afterwards.

Once the contract is initialized, after the else statement, the transaction's value is checked to be at least 1 ether - a fixed minimum for this example.

The `msg.data[0]` field is then checked to indicate a buy (passing 1 as first value) or a sell (passing 2 as first value) and the current balance available to buy. In our example, a seller would actually be giving away instead of selling. If the sender is buying and the balance allows it, we subtract the amount from the balance in storage and send twice the value to the buyer. If the sender is selling, as mentioned before, the transaction's value is added to the balance in storage and the sender can now feel very generous.

This example is greatly simplified. However, the actual contract implementation will be much more complex and useful. Other contracts will be receiving transactions from the exchange only, acting as secure data feeds and thus allowing them to update balances inside the exchange's contracts in a secure fashion.



A New Approach
--------------

Ethereum now allows us to build an exchange with a decentralized (but shared) order book, where every asset denominated in Ether can be handled in a trustless, automated, decentralized trading engine.

The main contract handles most of the interactions with the users, dispatching commands or simply refunding the user in case of an invalid request. Once the interface is stable enough, most or all of these errors should be caught before becoming transactions and actual trades or operation requests. The main contract will handle most of the exchange's logic, including trade verifications, but will only hold a few meta-data objects and the nonces of price indexes. 

A separate, possibly self-replicating contract will store those price indexes, which themselves include - at a bare minimum - prices and the total of trades per price. Another contract will handle a subcurrency as the base asset of the exchange. Its actual use is still being discussed since there is still a preference towards simply using Ether for all transactions if possible. However, a balance within the exchange still needs to be recorded, and such a subcurrency currently serves that purpose with that contract. A fourth contract, also self-replicating, will hold the actual trades and data. And, at the very least, a fifth contract is needed to hold the different markets being added.

[ A simple diagram describing how these various contracts perform and and relate to one another would be a good fit here. For the visual-learning mofos out there. ]

Other contracts will eventually get added for Contracts for Differences (CFDs) and any new features. It will also be up to the community to provide some of those contracts, something that should be made easy by copying a current set of contracts and their related interfaces.


Data structure and API
----------------------

A full description of the final contract storage data structure will be provided for anyone to read the exchange's orderbook and data.

### API

* __WARNING: Provisional API only, we are in the process of refactoring the API to offload more features to the interface__
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
* Amount in satoshi for BTC
* Lowest denomination of each subcurrency


### Prices

* Price in ETH/ETX * 10 ^ 8
* Price in ETH/BTC * 10 ^ 8


### Market IDs
```
1 = ETH/ETX
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
Market names follow the "ETH/<name>" convention. When registering a new market, submit the currency name as a three or four letter uppercase identifier, ex.: "BOB" for BobCoin.


### Minimum trade amounts
When adding a subcurrency, set the minimum trade amount high enough to make economic sense. A minimum of 10 ETH (1000000000000000000000 wei) is recommended.


### Examples

Buy 1000 ETH at 1200 ETH/ETX
```
1 1000000000000000000000 120000000000 1
```

Sell 1000 ETH at 1500 ETH/ETX
```
2 1000000000000000000000 150000000000 1
```

Fulfill trade(s)
```
3 0x3039 0x2f58 ...
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
7 1000000000000000000000 100000000 "BOB" 0xe559de5527492bcb42ec68d07df0742a98ec3f1e
```


Notes
-----
* Your Ethereum address is used as your identity



Interface
=========

EtherEx will provide an open-source interface on the Ethereum platform - both as a standalone web app that connects to a node, and as a client-browser interface. Despite its decentralized nature, its user interface can be constructed to appear and behave very similar to what traders are used to with current centralized exchanges.


###JSON API

While a complete JSON-RPC API will be provided to retrieve information about the exchange, users will be highly encouraged to provide their own nodes. All of the exchange's data will be available to users from the interface within the Ethereum client.
There will be no JSON or other type of trading API since the exchange is using Ethereum. Trading is carried out by sending transactions directly to the contract(s) running the exchange.

The same transaction API used by the interface will be available for anyone to create trading bots. Those bots will have to make transactions on the user's behalf instead of normal network requests. They will also be limited by block times, block gas limits, and transaction costs - which in turn, should greatly reduce the impact of trading bots on the exchange. Seasoned traders will nonetheless see many benefits in automating most operations.


Conclusion
==========

Blockchain technology solves many problems by empowering both the exchange and its users to easily access the same data. New challenges are introduced at many levels, and allocation of resources have to be carefully managed to create a favorable user experience, as well as provide useful decentralized services. However, these new possibilities - combined with the inherent security of the network - will allow for better, safer, and simpler trading tools operating in total transparency.



### References
[1]: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-White-Paper#scripting
1: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-White-Paper#scripting

[2]: https://docs.google.com/a/coinculture.info/document/d/1h9WY8XbT3cuIVN5mFmlkRJ8tHj5pJSnEpQ4__fslxXI
2: https://docs.google.com/a/coinculture.info/document/d/1h9WY8XbT3cuIVN5mFmlkRJ8tHj5pJSnEpQ4__fslxXI

[3]: http://faculty.chicagobooth.edu/eric.budish/research/HFT-FrequentBatchAuctions.pdf
3: http://faculty.chicagobooth.edu/eric.budish/research/HFT-FrequentBatchAuctions.pdf

[4]: http://users.encs.concordia.ca/~clark/papers/2014_weis.pdf
4: http://users.encs.concordia.ca/~clark/papers/2014_weis.pdf
