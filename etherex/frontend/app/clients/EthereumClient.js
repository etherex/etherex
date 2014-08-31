var utils = require("../js/utils");
var fixtures = require("../js/fixtures");

var EthereumClient = function() {

    this.loadAddresses = function(success, failure) {
        var addrs = eth.keys.map(function (k) { return eth.secretToAddress(k); });

        if (addrs)
            success(addrs);
        else
            failure("Unable to load addresses");
    };

    this.loadMarkets = function(success, failure) {
        var markets = [];
        var last = eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(18)));
        for (var i = 100; i <= 100 + parseInt(last); i = i + 5) {
          var id = eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(i+4)));
          markets[id] = {
            id: id,
            name: eth.toAscii(eth.stateAt(fixtures.addresses.markets, String(i))),
            address: eth.stateAt(fixtures.addresses.markets, String(i+3)),
            amount: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(i+1))),
            precision: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(i+2))),
          };
        };
        // console.log(markets);
        if (markets) {
            success(markets);
        }
        else {
            failure("Error loading markets.");
        }
    };

    this.updateBalance = function(address, success, failure) {
        var confirmed = eth.toDecimal(eth.balanceAt(address, -1));
        var unconfirmed = eth.toDecimal(eth.balanceAt(address));

        // DEBUG
        // console.log(eth.toDecimal(confirmed));
        // console.log(eth.toDecimal(unconfirmed));
        // console.log(utils.formatBalance(unconfirmed - confirmed));

        if (unconfirmed - confirmed >= 0) {
            success(
              utils.formatBalance(confirmed),
              (unconfirmed > confirmed) ? "(" + utils.formatBalance(unconfirmed - confirmed) + " unconfirmed)" : null
            );
        }
        else {
            failure("Failed to update balance.");
        }
    };


    this.updateBalanceSub = function(market, address, success, failure) {
        var confirmed = eth.toDecimal(eth.stateAt(market.address, address, -1));
        var unconfirmed = eth.toDecimal(eth.stateAt(market.address, address));

        // DEBUG
        // console.log(eth.toDecimal(confirmed));
        // console.log(eth.toDecimal(unconfirmed));
        // console.log(utils.formatBalance(unconfirmed - confirmed));

        if (unconfirmed - confirmed >= 0) {
            success(
              utils.formatBalance(confirmed),
              (unconfirmed > confirmed) ? "(" + utils.formatBalance(unconfirmed - confirmed) + " unconfirmed)" : null
            );
        }
        else {
            failure("Failed to update subcurrency balance.");
        }
    };

    this.loadTrades = function(markets, success, failure) {
        var trades = [];
        var last = eth.toDecimal(eth.stateAt(fixtures.addresses.trades, "0x12"));

        console.log("LAST TRADE AT: " + last);

        for (var i = 100; i <= 100 + parseInt(last); i = i + 5) {
            console.log(i);
            var type = eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i)));
            if (typeof type !== 'undefined' && type > 0) {
                var mid = parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+4))));
                trades[String(i)] = {
                    id: i,
                    type: type == 1 ? 'buy' : 'sell',
                    price: parseFloat(String(Ethereum.BigInteger(
                            String(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+1))))
                        ).divideAndRemainder(Ethereum.BigInteger("10").pow(8)))),
                    amount: parseFloat(String(Ethereum.BigInteger(
                            String(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+2))))
                        ).divideAndRemainder(Ethereum.BigInteger("10").pow(18)))),
                    // amount: eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+2))),
                    owner: eth.stateAt(fixtures.addresses.trades, String(i+3)),
                    market: {
                        id: mid,
                        name: markets[mid].name
                    }
                };
            }
        };

        if (trades) {
            success(trades);
        }
        else {
            failure("Error loading trades.");
        }
    };

    this.addTrade = function(trade, success, failure) {


        var bigamount = Ethereum.BigInteger(trade.amount)
            .multiply(Ethereum.BigInteger("10").pow(18))
            .divide(Ethereum.BigInteger(trade.price));

        var data =
            eth.pad(trade.type, 32) +
            eth.pad(bigamount, 32) +
            eth.pad(Ethereum.BigInteger(trade.price).multiply(Ethereum.BigInteger("10").pow(8)), 32) +
            eth.pad(trade.market, 32);

        try {
            eth.transact(
                eth.key,
                (trade.type == 1) ? trade.amount / trade.price : "0",
                fixtures.addresses.etherex,
                data,
                "10000",
                eth.gasPrice,
                success
            );
        }
        catch(e) {
            failure(e);
        }
    };
};

module.exports = EthereumClient;
