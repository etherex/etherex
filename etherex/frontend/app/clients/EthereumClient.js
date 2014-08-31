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
        // console.log(EtherEx.markets);
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

    this.addTrade = function(trade, success, failure) {
        // EtherEx.buy = function() {
        //   var data = EtherEx.txdata(1, 1);

        //   eth.transact(
        //     eth.key,
        //     "0",
        //     EtherEx.coinbase,
        //     data,
        //     "10000",
        //     eth.gasPrice,
        //     EtherEx.updateBalances
        //   );
        // };

        // EtherEx.sell = function() {
        //   var data = EtherEx.txdata(2, 1);

        //   eth.transact(
        //     eth.key,
        //     String(Ethereum.BigInteger(document.getElementById("amount").value).multiply(Ethereum.BigInteger("10").pow(18))),
        //     EtherEx.coinbase,
        //     data,
        //     "10000",
        //     eth.gasPrice,
        //     EtherEx.updateBalances
        //   );
        // };
        failure("Not implemented yet, sorry mate.");
    };
};

module.exports = EthereumClient;
