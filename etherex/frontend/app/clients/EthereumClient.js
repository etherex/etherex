var utils = require("../js/utils");

var EthereumClient = function() {

    this.loadMarkets = function(success, failure) {
        var markets = [];
        var last = eth.toDecimal(eth.stateAt(EtherEx.addresses.markets, String(18)));
        for (var i = 100; i <= 100 + parseInt(last); i = i + 5) {
          var id = eth.toDecimal(eth.stateAt(EtherEx.addresses.markets, String(i+4)));
          markets[id] = {
            id: id,
            name: eth.toAscii(eth.stateAt(EtherEx.addresses.markets, String(i))),
            address: eth.stateAt(EtherEx.addresses.markets, String(i+3)),
            amount: eth.toDecimal(eth.stateAt(EtherEx.addresses.markets, String(i+1))),
            precision: eth.toDecimal(eth.stateAt(EtherEx.addresses.markets, String(i+2))),
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

    this.updateBalance = function(success, failure) {
        var confirmed = eth.toDecimal(eth.balanceAt(EtherEx.addrs[0], -1));
        var unconfirmed = eth.toDecimal(eth.balanceAt(EtherEx.addrs[0]));

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


    this.updateBalanceSub = function(market, success, failure) {
        var confirmed = eth.toDecimal(eth.stateAt(market.address, EtherEx.addrs[0], -1));
        var unconfirmed = eth.toDecimal(eth.stateAt(market.address, EtherEx.addrs[0]));

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

};

module.exports = EthereumClient;
