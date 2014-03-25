EtherEx
=======

Decentralized exchange built on Ethereum.


##About

This repository contains the code that runs the exchange on Ethereum as a set of contracts, along with tests, simulations, tools and documentation.


##Components

* contracts: CLL contracts running EtherEx
* simulations: Python simulations for EtherEx
* compiler: Python compiler by Vitalik Buterin [repo](https://github.com/ethereum/compiler)
* cll-sim: CLL simulator by Joris Bontje [repo](https://github.com/jorisbontje/cll-sim)
* tests: extra tests


##Running tests

```
./runtests.py
```

Refer to the [compiler](https://github.com/ethereum/compiler) and [simulator](https://github.com/jorisbontje/cll-sim) for their respective usage.


##Requirements

```
pip install -r requirements.txt
```


##API (tx.data format) [TBD]

`operation amount marketid`

Operations: `1=BUY`, `2=SELL`, `3=DEPOSIT`, `4=WITHDRAW`, `5=CANCEL`
Amounts: wei for ETH and satoshi for BTC
Market IDs: `1=ETH/BTC`, `2=ETH/XETH`


## License

Released under the MIT License.
