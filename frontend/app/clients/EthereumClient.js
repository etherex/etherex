var utils = require("../js/utils");
var fixtures = require("../js/fixtures");

var bigRat = require('big-rational');

var web3 = require('ethereum.js');
window.web3 = web3;

if (ethBrowser)
    web3.setProvider(new web3.providers.QtProvider());
else
    web3.setProvider(new web3.providers.HttpRpcProvider('http://localhost:8080'));
// web3.setProvider(new web3.providers.AutoProvider());
// web3.setProvider(new web3.providers.WebSocketProvider('ws://localhost:40404/eth'));

var contract = web3.contract(fixtures.addresses.etherex, fixtures.contract_desc);
console.log("CONTRACT", contract);

web3.padDecimal = function (string, chars) {
    string = web3.fromDecimal(string).substr(2);
    return Array(chars - string.length + 1).join("0") + string;
};

var EthereumClient = function() {

    // Loading methods

    this.loadAddresses = function(success, failure) {
        var loadPromise = new Promise(function (resolve, reject) {
            web3.eth.accounts.then(function (accounts) {
                if (!accounts || accounts.length == 0)
                    reject("No accounts were found on this Ethereum node.");
                resolve(accounts);
            }, function (e) {
                reject("Error loading accounts: " + String(e));
            });
            setTimeout(function() {
                reject("Unable to load addresses, are you running an Ethereum node? Please load this URL in AlethZero, or with a cpp-ethereum node with JSONRPC enabled running alongside a regular browser.");
            }, 5000);
        });

        loadPromise.then(function (accounts) {
            success(accounts);
        }, function (e) {
            failure(e);
        });
    };

    this.loadMarkets = function(user, success, failure) {
        try {
            web3.eth.stateAt(fixtures.addresses.etherex, "0x5").then(function (hextotal) {
                var total = _.parseInt(web3.toDecimal(hextotal));

                console.log("TOTAL MARKETS: ", total, hextotal);

                if (!total || hextotal == "0x") {
                    failure("No market found, seems like contracts are missing.");
                    return;
                }

                var marketPromises = [];

                for (var id = 1; id < total + 1; id++) {
                    var marketPromise = new Promise(function (resolve, reject) {
                        contract.get_market(String(id)).call().then(function (market) {
                            try {
                                // console.log("Market from ABI:", market);

                                var id = _.parseInt(market[0]);
                                var name = web3.toAscii(market[1]);
                                var address = market[2].replace("0x000000000000000000000000", "0x");
                                var decimals = _.parseInt(market[3]);
                                var precision = _.parseInt(market[4]);
                                var minimum = _.parseInt(market[5]);
                                if (market[6] == 1)
                                    var lastPrice = null;
                                else
                                    var lastPrice = parseFloat(bigRat(market[6]).divide(bigRat(Math.pow(10, market[4].length - 1))).toDecimal());
                                var owner = market[7].replace("0x000000000000000000000000", "0x");
                                var block = _.parseInt(market[8]);
                                var total_trades = _.parseInt(market[9]);

                                // console.log(id, name, address, decimals, precision, minimum, lastPrice, owner, block);

                                web3.eth.stateAt(address, user.addresses[0]).then(function (balance) {
                                    resolve({
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
                                    });
                                }, function(e) {
                                    reject("Unable to get market balance: " + String(e));
                                });
                            }
                            catch(e) {
                                reject(e);
                            }
                        }, function(e) {
                            reject("Contract error: " + String(e));
                        });
                    });
                    marketPromises.push(marketPromise);
                }

                Promise.all(marketPromises).then(function (markets) {
                    success(markets);
                }, function(e) {
                    failure("Could not load all markets: " + String(e));
                });

            }, function(e) {
                failure("There seems to be a contract there, but no market was found: " + String(e));
            });
        }
        catch (e) {
            failure("Unable to load markets: " + String(e));
        }
    };

    this.loadTrades = function(flux, market, progress, success, failure) {
        try {
            // funid=11 -> 0x0a...
            var calldata = "0x0a" + web3.padDecimal(String(market.id), 64);
            // console.log("CALLDATA", calldata);

            // contract.get_trade_ids(String(market.id)).call().then(function (trade_ids) {
            web3.eth.call({to: fixtures.addresses.etherex, data: calldata}).then( function(raw_trade_ids) {
                // console.log("RAW TRADE IDS", raw_trade_ids);

                var trade_ids = [];
                raw_trade_ids = raw_trade_ids.substr(2);

                for (var i = 0; i < market.total_trades; i++) {
                    trade_ids.push(raw_trade_ids.slice(0, 64));
                    raw_trade_ids = raw_trade_ids.slice(64);
                };
                // console.log("TRADE IDS", trade_ids);

                if (!trade_ids || trade_ids.length == 0) {
                    failure("No trades found");
                    return;
                }

                var total = trade_ids.length;
                console.log("TOTAL TRADES: ", total);

                var tradePromises = [];

                for (var i = 0; i < total; i++) {
                    var tradePromise = new Promise(function (resolve, reject) {
                        var id = trade_ids[i];
                        var p = i;
                        contract.get_trade("0x" + id).call().then(function (trade) {
                            try {
                                // console.log("Trade from ABI:", trade);

                                var id = trade[0];

                                // Resolve on filled trades
                                if (id == "0x" + web3.padDecimal("0", 64))
                                    resolve({});

                                var type = _.parseInt(trade[1]);
                                var marketid = _.parseInt(trade[2]);
                                var amountPrecision = Math.pow(10, market.decimals);
                                var precision = market.precision;

                                // console.log("Loading trade " + id + " for market " + market.name);

                                var amount = bigRat(_.parseInt(trade[3])).divide(amountPrecision).valueOf();
                                var price = bigRat(_.parseInt(trade[4])).divide(precision).valueOf();

                                // console.log("Filling: " + eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr))));
                                // console.log("Pending: " + eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr), 0)));
                                // console.log("Mined: " + eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr), -1)));

                                resolve({
                                    id: trade[0],
                                    type: type == 1 ? 'buys' : 'sells',
                                    price: price,
                                    amount: amount,
                                    total: amount * price,
                                    owner: trade[5].replace("0x000000000000000000000000", "0x"),
                                    market: {
                                        id: market.id,
                                        name: market.name
                                    },
                                    status: 'mined',
                                    // status: (eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+1), 0)) == 0 ||
                                             // eth.toDecimal(eth.stateAt(fixtures.addresses.trades, String(ptr+1), -1)) == 0) ?
                                            // "pending" : "mined"
                                    block: _.parseInt(trade[6])
                                });

                                // Update progress
                                progress({percent: (p + 1) / total * 100 });
                            }
                            catch(e) {
                                reject(e);
                            }
                        }, function(e) {
                            reject("Contract error: " + String(e));
                        });
                    });
                    tradePromises.push(tradePromise);
                }

                Promise.all(tradePromises).then(function (trades) {
                    success(trades);
                }, function(e) {
                    failure("Could not load all trades: " + String(e));
                });

            }, function(e) {
                failure("There seems to be a contract there, but no market was found: " + String(e));
            });
        }
        catch (e) {
            failure("Unable to load trades: " + String(e));
        };
    };

    this.loadTransactions = function(addresses, market, success, failure) {
        var latest = []; // no eth.messages in eth.js...
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
            }).then(function (prices) {
                console.log("PRICE CHANGES: ", prices.length);
                if (prices.length)
                    console.log("PRICE DATA: " + prices[0].input);

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
            web3.eth.balanceAt(address).then(function (hexbalance) {
                if (!hexbalance || hexbalance == "0x") {
                    success(0, false);
                    return;
                }
                balance = web3.toDecimal(hexbalance);
                success(balance, false);
            }, function(e) {
                failure(error + e);
            });
        }
        catch(e) {
            failure(error + e);
        }

        // var confirmed = web3.toDecimal(web3.eth.balanceAt(address, -1));
        // var unconfirmed = web3.toDecimal(web3.eth.balanceAt(address));
        // var showUnconfirmed = false;

        // if (unconfirmed != confirmed) {
        //     showUnconfirmed = true;
        //     unconfirmed = this.formatUnconfirmed(confirmed, unconfirmed, utils.formatBalance);
        // }

        // if (confirmed >= 0) {
        //     success(
        //       confirmed,
        //       showUnconfirmed ? "(" + unconfirmed + " unconfirmed)" : null
        //     );
        // }
        // else {
        //     failure("Failed to update balance. We fell.");
        // }
    };

    this.updateBalanceSub = function(market, address, success, failure) {
        var error = "Failed to update subcurrency balance: ";

        try {
            var sub_balance = 0;
            web3.eth.stateAt(market.address, address).then(function (hexbalance) {
                if (hexbalance && hexbalance != "0x") {
                    sub_balance = " / " + utils.format(bigRat(web3.toDecimal(hexbalance)).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf());
                }
                else {
                    sub_balance = "";
                }

                contract.get_sub_balance(address, String(market.id)).call().then(function (balances) {
                    var available = balances[0];
                    var trading = balances[1];

                    if (!available || available == "0")
                        available = 0;
                    if (!trading || trading == "0")
                        trading = 0;
                    if (available == 0 && trading == 0 && !sub_balance) {
                        success(0, false);
                        return;
                    }
                    if (available)
                        available = bigRat(String(available)).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();
                    if (trading)
                        trading = utils.format(bigRat(String(trading)).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf());

                    success(available, " / " + String(trading) + " in trades" + (sub_balance ? sub_balance : ""));
                }, function(e) {
                    failure(error + e);
                    return;
                });
            });
        }
        catch(e) {
            failure(error + e);
        }

        // var confirmed = web3.toDecimal(web3.eth.stateAt(market.address, address, -1));
        // var unconfirmed = web3.toDecimal(web3.eth.stateAt(market.address, address));
        // var showUnconfirmed = false;

        // // DEBUG
        // // console.log("confirmed: " + confirmed);
        // // console.log("unconfirmed: " + unconfirmed);
        // // console.log(this.formatUnconfirmed(confirmed, unconfirmed));

        // if (unconfirmed != confirmed) {
        //     showUnconfirmed = true;
        //     unconfirmed = this.formatUnconfirmed(confirmed, unconfirmed, utils.format);
        // }

        // if (confirmed >= 0) {
        //     success(
        //       confirmed > 0 ? confirmed : 0,
        //       showUnconfirmed ? "(" + unconfirmed + " unconfirmed)" : null
        //     );
        // }
        // else {
        //     failure("Failed to update subcurrency balance. No dice.");
        // }
    };

    this.sendSub = function(amount, recipient, market, success, failure) {
        var subcontract = web3.contract(market.address, fixtures.sub_contract_desc);

        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                subcontract.send(recipient, amount).transact({
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success(result);
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
        }
    };

    this.depositSub = function(user, amount, market, success, failure) {
        var subcontract = web3.contract(market.address, fixtures.sub_contract_desc);

        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                subcontract.send(fixtures.addresses.etherex, amount).transact({
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success(result);
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
        }
    };

    this.withdrawSub = function(amount, market, success, failure) {
        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                contract.withdraw(amount, market.id).transact({
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success();
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
        }
    };

    this.registerMarket = function(market, success, failure) {
        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                contract.add_market(
                    web3.fromAscii(market.name, 32),
                    market.address,
                    market.decimals,
                    market.precision,
                    market.minimum
                ).transact({
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success();
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
        }
    };


    // Watches

    this.setUserWatches = function(flux, addresses, markets) {
        // ETH balance
        // console.log("Setting watchers for", addresses);
        web3.eth.watch({altered: addresses}).changed(flux.actions.user.updateBalance);

        // Sub balances
        var market_addresses = _.pluck(markets, 'address');
        // console.log("Setting sub watchers for markets", market_addresses);
        web3.eth.watch({altered: market_addresses}).changed(flux.actions.user.updateBalanceSub);
    };

    this.setMarketWatches = function(flux, markets) {
        flux.actions.trade.loadTrades();
        web3.eth.watch({altered: fixtures.addresses.etherex}).changed(flux.actions.market.updateMarket);
    };


    // Trade actions

    this.addTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        if (trade.type == 1)
            var addTrade = contract.buy;
        else if (trade.type == 2)
            var addTrade = contract.sell;
        else {
            failure("Invalid trade type.");
            return;
        }

        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                addTrade(amounts.amount, amounts.price, trade.market).transact({
                    from: user.addresses[0],
                    value: trade.type == 1 ? amounts.total : "0",
                    to: fixtures.addresses.etherex,
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success();
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
        }
    };

    this.fillTrades = function(user, trades, market, success, failure) {
        // Workaround for lack of array support
        for (var i = trades.length - 1; i >= 0; i--) {
            this.fillTrade(user, trades[i], market, success, failure);
        }

        // var total = bigRat(0);

        // for (var i = trades.length - 1; i >= 0; i--) {
        //     if (trades[i].type == 'sells') {
        //         var amounts = this.getAmounts(trades[i].amount, trades[i].price, market.decimals, market.precision);
        //         total += bigRat(amounts.total);
        //     }
        // };

        // var ids = _.pluck(trades, 'id');

        // var gas = ids.length * 10000;

        // try {
        //     web3.eth.gasPrice.then(function (gasPrice) {
        //         contract.trade(ids).transact({
        //             from: user.addresses[0],
        //             value: total > 0 ? total.toString() : "0",
        //             to: fixtures.addresses.etherex,
        //             gas: String(gas),
        //             gasPrice: gasPrice
        //         }).then(function (result) {
        //             success();
        //         }, function(e) {
        //             failure(e);
        //         });
        //     }, function (e) {
        //         failure(e);
        //     });
        // }
        // catch(e) {
        //     failure(e);
        // }
    };

    this.fillTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        // var calldata = "0x03" + trade.id.substr(2);

        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                // web3.eth.transact({
                contract.trade(trade.id).transact({
                    from: user.addresses[0],
                    value: trade.type == "sells" ? amounts.total : "0",
                    to: fixtures.addresses.etherex,
                    // data: calldata,
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success();
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
        }
    };

    this.cancelTrade = function(user, trade, success, failure) {
        try {
            web3.eth.gasPrice.then(function (gasPrice) {
                contract.cancel(trade.id).transact({
                    from: user.addresses[0],
                    value: "0",
                    to: fixtures.addresses.etherex,
                    gas: "10000",
                    gasPrice: gasPrice
                }).then(function (result) {
                    success();
                }, function(e) {
                    failure(e);
                });
            }, function (e) {
                failure(e);
            });
        }
        catch(e) {
            failure(e);
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
