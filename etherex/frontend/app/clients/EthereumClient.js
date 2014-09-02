var utils = require("../js/utils");
var fixtures = require("../js/fixtures");

require('lodash');
var bigRat = require('big-rational');

var EthereumClient = function() {

    // if (ethBrowser)
    //     eth.watch({altered: this.state.user.addresses}).changed(this.getFlux().actions.user.updateBalance);
    // else {
    //     for (var i = this.state.user.addresses.length - 1; i >= 0; i--)
    //       eth.watch(this.state.user.addresses[i], "", this.getFlux().actions.user.updateBalance);
    // }

    // console.log(this.state.market);
    // if (ethBrowser)
    //     eth.watch({altered: EtherEx.markets[1].address}).changed(this.updateBalance);
    // else
    //     eth.watch(EtherEx.markets[1].address, "", this.updateBalance);

    this.loadAddresses = function(success, failure) {
        var addrs = eth.keys.map(function (k) { return eth.secretToAddress(k); });

        if (addrs)
            success(addrs);
        else
            failure("Unable to load addresses. Lost your keys?");
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

        if (markets) {
            success(markets);
        }
        else {
            failure("Unable to load markets. Make a wish!");
        }
    };

    this.formatUnconfirmed = function(confirmed, unconfirmed) {
        unconfirmed = unconfirmed - confirmed;
        if (unconfirmed < 0)
            unconfirmed = "- " + utils.formatBalance(-unconfirmed);
        else
            unconfirmed = utils.formatBalance(unconfirmed);

        return unconfirmed;
    };

    this.getAmounts = function(amount, price) {
        var bigamount = bigRat(parseFloat(amount)).multiply(bigRat(fixtures.ether)).floor(true).toString();
        var bigprice = bigRat(parseFloat(price)).multiply(bigRat(fixtures.precision)).floor(true).toString();
        var total = bigRat(parseFloat(amount))
            .divide(parseFloat(price))
            .multiply(bigRat(fixtures.ether)).floor(true).toString();
        // console.log("amount: " + bigamount);
        // console.log("price: " + bigprice);
        // console.log("total: " + total);

        return {
            amount: bigamount,
            price: bigprice,
            total: total
        }
    };

    this.updateBalance = function(address, success, failure) {
        var confirmed = eth.toDecimal(eth.balanceAt(address, -1));
        var unconfirmed = eth.toDecimal(eth.balanceAt(address));
        var showUnconfirmed = false;

        // DEBUG
        // console.log("confirmed: " + confirmed);
        // console.log("unconfirmed: " + unconfirmed);
        // console.log(utils.formatBalance(unconfirmed - confirmed));

        if (unconfirmed != confirmed) {
            showUnconfirmed = true;
            unconfirmed = this.formatUnconfirmed(confirmed, unconfirmed);
        }

        if (confirmed >= 0) {
            success(
              utils.formatBalance(confirmed),
              showUnconfirmed ? "(" + unconfirmed + " unconfirmed)" : null
            );
        }
        else {
            failure("Failed to update balance. We fell.");
        }
    };


    this.updateBalanceSub = function(market, address, success, failure) {
        var confirmed = eth.toDecimal(eth.stateAt(market.address, address, -1));
        var unconfirmed = eth.toDecimal(eth.stateAt(market.address, address));
        var showUnconfirmed = false;

        // DEBUG
        // console.log(eth.toDecimal(confirmed));
        // console.log(eth.toDecimal(unconfirmed));
        // console.log(utils.formatBalance(unconfirmed - confirmed));

        if (unconfirmed != confirmed) {
            showUnconfirmed = true;
            unconfirmed = this.formatUnconfirmed(confirmed, unconfirmed);
        }

        if (confirmed >= 0) {
            success(
              utils.formatBalance(confirmed),
              (unconfirmed > confirmed) ? "(" + utils.formatBalance(unconfirmed - confirmed) + " unconfirmed)" : null
            );
        }
        else {
            failure("Failed to update subcurrency balance. No dice.");
        }
    };

    this.loadTrades = function(markets, success, failure) {
        var trades = [];
        var last = eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(18)));

        console.log("LAST TRADE AT: " + last);

        for (var i = 100; i <= 100 + parseInt(last); i = i + 5) {
            var type = eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i)));
            if (!_.isUndefined(type) && type > 0) {
                var mid = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+4))));
                trades[String(i)] = {
                    id: i,
                    type: type == 1 ? 'buy' : 'sell',
                    price: bigRat(
                            eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+1)))
                        ).divide(fixtures.precision).valueOf(),
                    amount: bigRat(
                            eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(i+2)))
                        ).divide(fixtures.ether).valueOf(),
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
            failure("Unable to load trades. Playing cards.");
        }
    };


    this.addTrade = function(trade, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price);

        var data =
            eth.pad(trade.type, 32) +
            eth.pad(amounts.amount, 32) +
            eth.pad(amounts.price, 32) +
            eth.pad(trade.market, 32);

        try {
            if (ethBrowser)
                eth.transact({
                    from: eth.key,
                    value: trade.type == 1 ? amounts.total : "0",
                    to: fixtures.addresses.etherex,
                    data: eth.fromAscii(data),
                    gas: "10000",
                    gasPrice: eth.gasPrice
                }, success);
            else
                eth.transact(
                    eth.key,
                    trade.type == 1 ? amounts.total : "0",
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

    this.fillTrade = function(trade, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price);

        var data =
            eth.pad(3, 32) +
            eth.pad(trade.id, 32);

        try {
            if (ethBrowser)
                eth.transact({
                    from: eth.key,
                    value: trade.type == 2 ? amounts.total : "0",
                    to: fixtures.addresses.etherex,
                    data: eth.fromAscii(data),
                    gas: "10000",
                    gasPrice: eth.gasPrice
                }, success);
            else
                eth.transact(
                    eth.key,
                    trade.type == 2 ? amounts.total : "0",
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

    this.cancelTrade = function(trade, success, failure) {
        var data =
            eth.pad(6, 32) +
            eth.pad(trade.id, 32);

        try {
            if (ethBrowser)
                eth.transact({
                    from: eth.key,
                    value: "0",
                    to: fixtures.addresses.etherex,
                    data: eth.fromAscii(data),
                    gas: "10000",
                    gasPrice: eth.gasPrice
                }, success);
            else
                eth.transact(
                    eth.key,
                    "0",
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
