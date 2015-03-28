var utils = require("../js/utils");
var fixtures = require("../js/fixtures");

var bigRat = require('big-rational');

var isMist = false;

require('es6-promise').polyfill();

if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}

try {
    web3.setProvider(new web3.providers.HttpProvider());

    try {
        var m = web3.eth.getStorageAt(fixtures.addresses.etherex, "0x5");
    }
    catch (e) {
        web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
        isMist = true;
    }

    var ContractABI = web3.eth.contract(fixtures.contract_desc);
    var contract = new ContractABI(fixtures.addresses.etherex);

    // console.log("CLIENT", web3.version.client);
    // console.log("CONTRACT", contract);
}
catch(e) {
    console.log("Some ethereum.js error", String(e));
}

web3.padDecimal = function (string, chars) {
    string = web3.fromDecimal(string).substr(2);
    return Array(chars - string.length + 1).join("0") + string;
};

var EthereumClient = function() {

    // Loading methods

    this.loadAddresses = function(success, failure) {
        var loadPromise = new Promise(function (resolve, reject) {
            try {
                var accounts = web3.eth.accounts;

                if (!accounts || accounts.length == 0)
                    reject("No accounts were found on this Ethereum node.");

                resolve(accounts);
            }
            catch (e) {
                reject("Unable to load addresses, are you running an Ethereum node? Please load this URL in AlethZero, or with a cpp-ethereum node with JSONRPC enabled running alongside a regular browser.");
                // reject("Error loading accounts: " + String(e));
            }
        });

        loadPromise.then(function (accounts) {
            success(accounts);
        }, function (e) {
            failure(String(e));
        });
    };

    this.loadMarkets = function(user, success, failure) {
        try {
            var last = _.parseInt(contract.call().get_last_market_id().toString());

            // console.log("LAST MARKET ID: ", last);

            if (!last && !isMist) {
                failure("No market found, seems like contracts are missing.");
                return;
            }

            var markets = [];

            var favs = localStorage.getItem('favorites');
            var favorites = JSON.parse(favs);

            if (!favorites || typeof(favorites) != 'object')
                favorites = [];
            // console.log('FAVORITES', favorites);

            for (var i = 1; i < last + 1; i++) {
                try {
                    var market = contract.call().get_market(i);
                    // console.log("Market from ABI:", market);

                    var id = _.parseInt(market[0].toString());
                    var name = web3.toAscii(web3.fromDecimal(market[1].toString()));
                    var address = web3.fromDecimal(market[2]);
                    var decimals = _.parseInt(market[3].toString());
                    var precision = _.parseInt(market[4].toString());
                    var minimum = _.parseInt(market[5].toString());
                    if (market[6] == 1)
                        var lastPrice = null;
                    else
                        var lastPrice = parseFloat(bigRat(market[6].toString()).divide(bigRat(Math.pow(10, market[4].toString().length - 1))).toDecimal());
                    var owner = web3.fromDecimal(market[7]);
                    var block = _.parseInt(market[8].toString());
                    var total_trades = _.parseInt(market[9].toString());

                    // console.log(id, name, address, decimals, precision, minimum, lastPrice, owner, block, total_trades);

                    var SubContractABI = web3.eth.contract(fixtures.sub_contract_desc);
                    var subcontract = new SubContractABI(address);
                    var balance = subcontract.call().balance(user.addresses[0]).toString();

                    var favorite = false;
                    if (favorites.length > 0 && _.indexOf(favorites, id) >= 0)
                        var favorite = true;

                    markets.push({
                        id: id,
                        name: name,
                        address: address,
                        decimals: decimals,
                        minimum: minimum,
                        precision: precision,
                        lastPrice: lastPrice,
                        owner: owner,
                        block: block,
                        total_trades: total_trades,
                        balance: _.parseInt(balance),
                        favorite: favorite
                    });
                }
                catch(e) {
                    failure("Unable to load market " + i + ": " + String(e));
                }
            }

            if (markets)
                success(markets);
            else
                failure("No market to load.")
        }
        catch (e) {
            if (isMist)
                success("Skipping...");
            failure("Unable to load markets: " + String(e));
        }
    };

    this.loadTrades = function(flux, market, progress, success, failure) {
        try {
            // Set defaultBlock to 'pending' trade IDs
            web3.eth.defaultBlock = 'pending';

            var trade_ids = contract.call().get_trade_ids(market.id);

            if (!trade_ids || trade_ids.length == 0) {
                failure("No trades found");
                return;
            }

            var total = trade_ids.length;
            // console.log("TOTAL TRADES: ", total);

            var tradePromises = [];

            for (var i = 0; i < total; i++) {
                var tradePromise = new Promise(function (resolve, reject) {
                    var id = trade_ids[i];
                    var p = i;

                    var trade = contract.call().get_trade(id);
                    // console.log("Trade from ABI:", trade);

                    try {
                        var id = web3.fromDecimal(trade[0]);
                        var ref = trade[7];

                        // Resolve on filled trades
                        if (id == "0x0" || ref == "0"){
                            resolve({});
                            return;
                        }

                        var status = 'mined';

                        var tradeExists = web3.eth.getStorageAt(fixtures.addresses.etherex, web3.fromDecimal(ref), 'latest');

                        if (tradeExists == "0x00")
                            status = 'pending';
                        else
                            status = 'mined';

                        var type = _.parseInt(trade[1].toString());
                        var marketid = _.parseInt(trade[2].toString());
                        var amountPrecision = Math.pow(10, market.decimals);
                        var precision = market.precision;

                        // console.log("Loading trade " + id + " for market " + market.name);

                        var amount = bigRat(trade[3].toString()).divide(amountPrecision).valueOf();
                        var price = bigRat(trade[4].toString()).divide(precision).valueOf();

                        // Update progress
                        progress({percent: (p + 1) / total * 100 });

                        resolve({
                            id: id,
                            type: type == 1 ? 'buys' : 'sells',
                            price: price,
                            amount: amount,
                            total: amount * price,
                            owner: web3.fromDecimal(trade[5].toString()),
                            market: {
                                id: market.id,
                                name: market.name
                            },
                            status: status,
                            block: _.parseInt(trade[6].toString())
                        });
                    }
                    catch(e) {
                        reject(e);
                    }
                });
                tradePromises.push(tradePromise);
            }

            Promise.all(tradePromises).then(function (trades) {
                // console.log("TRADES", trades);
                success(trades);
            }, function(e) {
                failure("Could not load all trades: " + String(e));
            });
        }
        catch (e) {
            failure("Unable to load trades: " + String(e));
        };
    };

    this.loadPrices = function(market, success, failure) {
        var prices = [];

        // console.log("Loading prices...");

        try {
            var prices_filter = web3.eth.filter({
                limit: 100,
                address: fixtures.addresses.etherex,
                topics: [market.address]
            });
            var pricelogs = prices_filter.get();
            // console.log("PRICE CHANGES: ", pricelogs);

            var prices = [];
            var amountPrecision = Math.pow(10, market.decimals);
            var precision = market.precision;

            for (var i = pricelogs.length - 1; i >= 0; i--) {
                var pricelog = {
                    timestamp: _.parseInt(web3.toDecimal(pricelogs[i].data)),
                    type: _.parseInt(web3.toDecimal(pricelogs[i].topic[1])),
                    price: bigRat(web3.toDecimal(pricelogs[i].topic[2])).divide(precision).valueOf(),
                    amount: bigRat(web3.toDecimal(pricelogs[i].topic[3])).divide(amountPrecision).valueOf()
                };
                prices.push(pricelog);
            };

            // console.log("PRICES", prices);

            success(prices);
        }
        catch (e) {
            failure("Unable to load prices: " + String(e));
        }
    };

    this.loadTransactions = function(addresses, market, success, failure) {
        var latest = [];
        var prices = [];

        console.log("Loading transactions...");

        try {
            var slot = ((market.id - 1) * fixtures.market_fields + 20).toString(16);
            web3.eth.logs({
                // max: 100,
                // latest: -1,
                // from: fixtures.addresses.etherex,
                // to: fixtures.addresses.etherex,
                // altered: {
                //     id: fixtures.addresses.etherex,
                //     at: "0x" + slot // "0x69" // TODO get market price slot
                // }
            }).then(function (txs) {
                console.log("TRANSACTIONS: ", txs);

                var from = web3.eth.logs({max: 100, latest: -1, altered: addresses[0], from: fixtures.addresses.etherex});
                // console.log(from.length);
                // var to = eth.messages({latest: -1, altered: addresses[0], to: addresses[1]});
                // console.log(to.length);
                var origin = web3.eth.logs({max: 100, latest: -1, altered: addresses[0], to: fixtures.addresses.etherex});
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

                var payload = {
                    latest: latest,
                    prices: prices
                };

                // if (latest.length <=0)
                //     var latest = [{}];

                if (latest || prices) // && latest.length > 0)
                    success(payload);
            }, function(e) {
                failure("Could not get transactions: " + String(e));
            });
        }
        catch (e) {
            failure("Unable to load transactions: " + String(e));
        }
    };


    // Balances

    this.updateBalance = function(address, success, failure) {
        var error = "Failed to update balance: ";

        try {
            var hexbalance = web3.eth.getBalance(address);
            // console.log("BALANCE", hexbalance.toString());

            if (!hexbalance || hexbalance == "0x") {
                success(0, false);
                return;
            }
            var balance = web3.toDecimal(hexbalance);
            success(balance, false);
        }
        catch(e) {
            failure(error + String(e));
        }
    };

    this.updateBalanceSub = function(market, address, success, failure) {
        var error = "Failed to update subcurrency balance: ";

        if (!market || !address)
            return;

        try {
            var SubContractABI = web3.eth.contract(fixtures.sub_contract_desc);
            var subcontract = new SubContractABI(market.address);
            var sub_balance = _.parseInt(subcontract.call().balance(address).toString());

            var balances = contract.call().get_sub_balance(address, market.id);

            var available = balances[0].toString();
            var trading = balances[1].toString();

            if (!available || available == "0")
                available = 0;
            if (!trading || trading == "0")
                trading = 0;

            if (!available && !trading && !sub_balance) {
                success(market, 0, 0, 0);
                return;
            }

            if (available)
                available = bigRat(available).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();
            if (trading)
                trading = bigRat(trading).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();

            success(market, available, trading, sub_balance);
        }
        catch(e) {
            if (isMist)
                success("Skipping...");
            failure(error + String(e));
        }
    };

    this.sendSub = function(amount, recipient, market, success, failure) {
        var SubContractABI = web3.eth.contract(fixtures.sub_contract_desc);
        var subcontract = new SubContractABI(market.address);

        try {
            var result = subcontract.sendTransaction({
                gas: "100000"
            }).send(recipient, amount);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.depositSub = function(user, amount, market, success, failure) {
        var SubContractABI = web3.eth.contract(fixtures.sub_contract_desc);
        var subcontract = new SubContractABI(market.address);

        try {
            var result = subcontract.sendTransaction({
                gas: "100000"
            }).send(fixtures.addresses.etherex, amount);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.withdrawSub = function(amount, market, success, failure) {
        try {
            var result = contract.sendTransaction({
                gas: "100000"
            }).withdraw(amount, market.id);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.registerMarket = function(market, success, failure) {
        try {
            var result = contract.sendTransaction({
                gas: "100000"
            }).add_market(
                web3.fromAscii(market.name, 32),
                market.address,
                market.decimals,
                market.precision,
                market.minimum
            );

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };


    // Watches

    this.setUserWatches = function(flux, addresses, markets) {
        // ETH balance
        web3.eth.filter({address: addresses}).watch(flux.actions.user.updateBalance);

        // Sub balances
        var market_addresses = _.pluck(markets, 'address');
        web3.eth.filter({address: market_addresses}).watch(flux.actions.user.updateBalanceSub);
    };

    this.setMarketWatches = function(flux, markets) {
        web3.eth.filter({address: fixtures.addresses.etherex}).watch(flux.actions.market.updateMarkets);
    };


    // Trade actions

    this.addTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        try {
            var options = {
                from: user.addresses[0],
                value: trade.type == 1 ? amounts.total : "0",
                to: fixtures.addresses.etherex,
                gas: "500000"
            };

            if (trade.type == 1)
                var result = contract.sendTransaction(options).buy(amounts.amount, amounts.price, trade.market);
            else if (trade.type == 2)
                var result = contract.sendTransaction(options).sell(amounts.amount, amounts.price, trade.market);
            else {
                failure("Invalid trade type.");
                return;
            }

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.fillTrades = function(user, trades, market, success, failure) {
        // Workaround for lack of array support
        // for (var i = 0; i < trades.length; i++)
        //     this.fillTrade(user, trades[i], market, success, failure);

        var total = bigRat(0);
        var total_amounts = bigRat(0);

        for (var i = trades.length - 1; i >= 0; i--) {
            var amounts = this.getAmounts(trades[i].amount, trades[i].price, market.decimals, market.precision);

            if (trades[i].type == 'sells')
                total += bigRat(amounts.total);

            total_amounts += bigRat(amounts.amount);
        };

        var ids = _.pluck(trades, 'id');

        var gas = ids.length * 100000;

        try {
            var result = contract.sendTransaction({
                from: user.addresses[0],
                gas: String(gas),
                to: fixtures.addresses.etherex,
                value: total > 0 ? total.toString() : "0"
            }).trade(total_amounts, ids);

            success(result);
        }
        catch(e) {
            failure(e);
        }
    };

    this.fillTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        try {
            var result = contract.sendTransaction({
                from: user.addresses[0],
                gas: "100000",
                to: fixtures.addresses.etherex,
                value: trade.type == "sells" ? amounts.total : "0"
            }).trade(amounts.amount, [trade.id]);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.cancelTrade = function(user, trade, success, failure) {
        try {
            var result = contract.sendTransaction({
                from: user.addresses[0],
                value: "0",
                to: fixtures.addresses.etherex,
                gas: "100000"
            }).cancel(trade.id);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };


    // Utilities

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
