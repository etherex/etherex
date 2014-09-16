var utils = require("../js/utils");
var fixtures = require("../js/fixtures");

var bigRat = require('big-rational');

var EthereumClient = function() {

    this.loadAddresses = function(success, failure) {
        var addresses = eth.keys.map(function (k) { return eth.secretToAddress(k); });

        if (addresses)
            success(addresses);
        else
            failure("Unable to load addresses. Lost your keys?");
    };


    this.loadMarkets = function(success, failure) {
        var markets = [{}];

        var total = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(2))));
        var ptr = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(18))));
        var last = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(19))));

        console.log("TOTAL MARKETS: " + total);
        console.log("MARKETS START: " + ptr);
        console.log("MARKETS LAST: " + last);

        for (var i = 0; i < total; i++) {
            var id = eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+7)));
            console.log("LOADING MARKET ID: " + id);
            if (id) {
                markets.push({
                    id: id,
                    name: eth.toAscii(eth.stateAt(fixtures.addresses.markets, String(ptr))),
                    address: eth.stateAt(fixtures.addresses.markets, String(ptr+3)),
                    amount: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+1))),
                    precision: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+2))),
                    price: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+4))),
                    decimals: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+5))),
                });
            }
            ptr = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+9))));
        };

        if (markets) {
            success(markets);
        }
        else {
            failure("Unable to load markets. Make a wish!");
        }
    };


    this.setUserWatches = function(flux, addresses, markets) {
        if (ethBrowser) {
            // ETH balance
            eth.watch({altered: addresses}).changed(flux.actions.user.updateBalance);

            // Sub balances
            var market_addresses = _.rest(_.pluck(markets, 'address'));

            eth.watch({altered: market_addresses}).changed(flux.actions.user.updateBalanceSub);
        }
        else {
            for (var i = addresses.length - 1; i >= 0; i--) {
                eth.watch(addresses[i], "", flux.actions.user.updateBalance);

                flux.actions.user.updateBalanceSub();
                for (var m = markets.length - 1; m >= 0; m--)
                    eth.watch(markets[m].address, "", flux.actions.user.updateBalanceSub);
            }
        }
    };


    this.setMarketWatches = function(flux, markets) {
        var market_addresses = _.rest(_.pluck(markets, 'address'));
        if (ethBrowser) {
            eth.watch({altered: market_addresses}).changed(flux.actions.trade.loadTrades);
        }
        else {
            flux.actions.trade.loadTrades();
        //     for (var i = market_addresses.length - 1; i >= 0; i--) {
        //         flux.actions.trade.loadTrades();
        //         eth.watch(market_addresses[i], "", flux.actions.trade.loadTrades);
        //     }
        }
    };


    this.updateBalance = function(address, success, failure) {
        var confirmed = eth.toDecimal(eth.balanceAt(address, -1));
        var unconfirmed = eth.toDecimal(eth.balanceAt(address));
        var showUnconfirmed = false;

        if (unconfirmed != confirmed) {
            showUnconfirmed = true;
            unconfirmed = this.formatUnconfirmed(confirmed, unconfirmed, utils.formatBalance);
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
        // console.log("confirmed: " + confirmed);
        // console.log("unconfirmed: " + unconfirmed);
        // console.log(this.formatUnconfirmed(confirmed, unconfirmed));

        if (unconfirmed != confirmed) {
            showUnconfirmed = true;
            unconfirmed = this.formatUnconfirmed(confirmed, unconfirmed, utils.format);
        }

        if (confirmed >= 0) {
            success(
              confirmed > 0 ? utils.format(confirmed) : 0,
              showUnconfirmed ? "(" + unconfirmed + " unconfirmed)" : null
            );
        }
        else {
            failure("Failed to update subcurrency balance. No dice.");
        }
    };


    this.loadTrades = function(flux, markets, progress, success, failure) {
        var trades = [];
        var total = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(2))));
        var ptr = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(18))));
        var last = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(19))));
        var start = ptr;

        console.log("TOTAL TRADES: " + total);
        console.log("TRADES START: " + ptr);
        console.log("TRADES LAST: " + last);

        for (var i = 0; i < total; i++) {
            var type = eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr)));
            if (type) {
                var mid = eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+4)));
                console.log("Loading trade " + i + " for market " + markets[mid].name);
                trades.push({
                    id: ptr,
                    type: type == 1 ? 'buy' : 'sell',
                    price: bigRat(
                            eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+1)))
                        ).divide(fixtures.precision).valueOf(),
                    amount: bigRat(
                            eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+2)))
                        ).divide(fixtures.ether).valueOf(),
                    owner: eth.stateAt(fixtures.addresses.trades, String(ptr+3)),
                    market: {
                        id: mid,
                        name: markets[mid].name
                    }
                });
            }
            ptr = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+9))));

            progress({percent: (i + 1) / total * 100 });
        };

        setTimeout(function() { // temporary slowdown while testing
            if (trades) {
                success(trades);
            }
            else {
                failure("Unable to load trades. Playing cards.");
            }
        }, 500);
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
                    value: trade.type == "sell" ? amounts.total : "0",
                    to: fixtures.addresses.etherex,
                    data: eth.fromAscii(data),
                    gas: "10000",
                    gasPrice: eth.gasPrice
                }, success);
            else
                eth.transact(
                    eth.key,
                    trade.type == "sell" ? amounts.total : "0",
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

    this.formatUnconfirmed = function(confirmed, unconfirmed, fn) {
        unconfirmed = unconfirmed - confirmed;
        if (unconfirmed < 0)
            unconfirmed = "- " + fn(-unconfirmed);
        else
            unconfirmed = fn(unconfirmed);

        return unconfirmed;
    };

};

module.exports = EthereumClient;
