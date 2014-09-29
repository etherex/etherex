var utils = require("../js/utils");
var fixtures = require("../js/fixtures");

var bigRat = require('big-rational');

var EthereumClient = function() {

    this.loadAddresses = function(success, failure) {
        var addresses = [];
        var error = null;

        try {
            addresses = eth.keys.map(function (k) { return eth.secretToAddress(k); });
        }
        catch (e) {
            error = String(e);
        }

        if (!error)
            success(addresses);
        else
            failure("Unable to load addresses. Lost your keys? The actual error was: " + error);
    };


    this.loadMarkets = function(user, success, failure) {
        var markets = [{}];

        var total = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(2))));
        var ptr = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(18))));
        var last = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(19))));

        console.log("TOTAL MARKETS: " + total);
        console.log("MARKETS START: " + ptr);
        console.log("MARKETS LAST: " + last);

        // console.log(user);
        for (var i = 0; i < total; i++) {
            var id = eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+6)));
            console.log("LOADING MARKET ID: " + id);
            if (id) {
                var address = eth.stateAt(fixtures.addresses.markets, String(ptr+1));
                markets.push({
                    id: id,
                    name: eth.toAscii(eth.stateAt(fixtures.addresses.markets, String(ptr))),
                    address: address,
                    decimals: _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+2)))),
                    minimum: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+3))),
                    precision: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+4))),
                    lastPrice: eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+5))),
                    balance: eth.toDecimal(eth.stateAt(address, user.addresses[0], -1)),
                });
            }
            ptr = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.markets, String(ptr+9))));
        };

        if (markets.length > 1) {
            success(markets);
        }
        else {
            failure("Unable to load markets. Make a wish! (no really, can't find the contracts...)");
        }
    };


    this.setUserWatches = function(flux, addresses, markets) {
        if (ethBrowser) {
            // ETH balance
            // eth.watch({altered: addresses}).uninstall();
            eth.watch({altered: addresses}).changed(flux.actions.user.updateBalance);

            // Sub balances
            var market_addresses = _.rest(_.pluck(markets, 'address'));

            // eth.watch({altered: market_addresses}).uninstall();
            eth.watch({altered: market_addresses}).changed(flux.actions.user.updateBalanceSub);
        }
        else {
            // for (var i = addresses.length - 1; i >= 0; i--) {
            eth.unwatch("", addresses[0]);
            eth.watch(addresses[0], "", flux.actions.user.updateBalance);

            flux.actions.user.updateBalanceSub();
            // for (var m = markets.length - 1; m >= 0; m--)
            eth.unwatch("", markets[1].address);
            eth.watch(markets[1].address, "", flux.actions.user.updateBalanceSub);
        }
    };


    this.setMarketWatches = function(flux, markets) {
        // var market_addresses = _.rest(_.pluck(markets, 'address'));
        if (ethBrowser) {
            eth.watch({altered: fixtures.addresses.trades}).changed(flux.actions.trade.updateTrades);
        }
        else {
            flux.actions.trade.loadTrades();
            // eth.watch(fixtures.addresses.trades, "", flux.actions.trade.updateTrades);
            // eth.unwatch("", market_addresses[1]);
            // eth.watch(market_addresses[0], "", flux.actions.trade.updateTrades);
            setTimeout(flux.actions.trade.updateTrades, 60000);
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
              confirmed,
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
              confirmed > 0 ? confirmed : 0,
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
                var marketid = _.parseInt(eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+4))));
                var amountPrecision = Math.pow(10, markets[marketid].decimals);
                var precision = markets[marketid].precision;

                console.log("Loading trade " + i + " for market " + markets[marketid].name);

                var price = bigRat(
                    eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+1)))
                ).divide(precision).valueOf()
                var amount = bigRat(
                    eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+2)))
                ).divide(amountPrecision).valueOf();

                // console.log("Filling: " + eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr))));
                // console.log("Pending: " + eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr), 0)));
                // console.log("Mined: " + eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr), -1)));

                trades.push({
                    id: ptr,
                    type: type == 1 ? 'buys' : 'sells',
                    price: price,
                    amount: amount,
                    total: amount * price,
                    owner: eth.stateAt(fixtures.addresses.trades, String(ptr+3)),
                    market: {
                        id: marketid,
                        name: markets[marketid].name
                    },
                    status: (eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+1), 0)) == 0 ||
                             eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+1), -1)) == 0) ?
                            "pending" : "mined"
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


    this.addTrade = function(trade, market, success, failure) {
        // console.log(trade.amount, trade.price, trade);
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        var data =
            eth.pad(trade.type, 32) +
            eth.pad(amounts.amount, 32) +
            eth.pad(amounts.price, 32) +
            eth.pad(trade.market, 32);

        console.log("Sending " + eth.fromAscii(data));
        if (trade.type == 1)
            console.log("with " + amounts.total + " wei");

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

    this.fillTrades = function(trades, market, success, failure) {
        var total = bigRat(0);

        for (var i = trades.length - 1; i >= 0; i--) {
            var amounts = this.getAmounts(trades[i].amount, trades[i].price, market.decimals, market.precision);
            total += bigRat(amounts.total);
        };

        var ids = _.pluck(trades, 'id');
        var data = eth.pad(3, 32);

        for (var i = ids.length - 1; i >= 0; i--) {
            data += eth.pad(ids[i], 32);
        };

        var gas = ids.length * 10000;

        // console.log("Posting " + eth.fromAscii(data));
        // console.log("with value " + utils.formatBalance(total.toString()));

        try {
            if (ethBrowser)
                eth.transact({
                    from: eth.key,
                    value: total > 0 ? total.toString() : "0",
                    to: fixtures.addresses.etherex,
                    data: eth.fromAscii(data),
                    gas: String(gas),
                    gasPrice: eth.gasPrice
                }, success);
            else
                eth.transact(
                    eth.key,
                    total > 0 ? total.toString() : "0",
                    fixtures.addresses.etherex,
                    data,
                    String(gas),
                    eth.gasPrice,
                    success
                );
        }
        catch(e) {
            failure(e);
        }
    };

    this.fillTrade = function(trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

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

    this.loadTransactions = function(addresses, success, failure) {
        if (ethBrowser) {
            var txs = [];
            var from = eth.messages({max: 20, latest: -1, altered: addresses[0], from: fixtures.addresses.etherex});
            // console.log(from.length);
            // var to = eth.messages({latest: -1, altered: addresses[0], to: addresses[1]});
            // console.log(to.length);
            var origin = eth.messages({max: 20, latest: -1, altered: addresses[0], to: fixtures.addresses.etherex});
            // console.log(origin.length);
            // var to = eth.messages({latest: -1, altered: addresses[0], from: fixtures.addresses.etherex, to: addresses[0]});
            var latest = _.merge(from, origin);
            // console.log(latest.length);

            // if (typeof(addresses) == 'array' && addresses.length == 2)
            //     latest = _.filter(latest, {'to': addresses[1]});
            // for (var i = 0; i < addresses.length; i++) {
                // txs.push(_.filter(latest, {'to': addresses[1]}));
                // txs.push(_.filter(latest, {'from': addresses[1]}));
                // txs.push(_.filter(latest, {'origin': addresses[i]}));
            // };
            // latest.push(_.where(eth.messages({altered: addresses[0]}), {'from': addresses[1]}));
            // latest.push(eth.messages({latest: -1, from: addresses[1], to: addresses[0]}));
        }
        else
            var latest = []; // no eth.messages in eth.js...

        // if (latest.length <=0)
        //     var latest = [{}];

        if (latest) // && latest.length > 0)
            success(latest);
        else
            failure("Could not get transactions.");
    };

    this.getAmounts = function(amount, price, decimals, precision) {
        var bigamount = bigRat(amount).multiply(bigRat(Math.pow(10, decimals))).floor(true).toString();
        var bigprice = bigRat(price).multiply(bigRat(precision)).floor(true).toString();
        var total = bigRat(amount)
            .multiply(price)
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
