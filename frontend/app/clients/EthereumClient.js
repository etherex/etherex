var _ = require("lodash");
var utils = require("../js/utils");
var fixtures = require("../js/fixtures");
var abi = require("../js/abi");

var bigRat = require('big-rational');

if (typeof web3 === 'undefined') {
    var web3 = require('web3');
    window.web3 = web3;
}

web3.padDecimal = function (string, chars) {
    string = web3.fromDecimal(string).substr(2);
    return Array(chars - string.length + 1).join("0") + string;
};

var EthereumClient = function(params) {
    try {
        web3.setProvider(new web3.providers.HttpProvider('//' + params.host));

        var ContractABI = web3.eth.contract(abi.etherex);
        this.contract = ContractABI.at(params.address);

        // if (web3.eth.getCode(params.address) == "0x")
        //     utils.error("Unable to find contract at", params.address);
    }
    catch(e) {
        utils.error("Some web3.js error...", e);
    }

    this.filters = {};

    this.isAvailable = function() {
      // attempt an RPC call that should fail if the daemon is unreachable.
      try {
        return web3.net.listening;
      } catch(err) {
        return false;
      }
    };

    this.onNewBlock = function(callback) {
      if (params.debug)
        utils.log("WATCHING", "BLOCKS");
      this.filters.latest = web3.eth.filter('latest');
      this.filters.latest.watch(
        _.debounce(
          function (err, log) {
            if (params.debug)
              utils.log("NEW_BLOCK", log);
            if (log)
              callback(err, log);
          },
        1000)
      );
    };

    this.stopWatching = function(failure) {
      try {
        _.each(this.filters, function(filter) {
          filter.stopWatching();
        });
      }
      catch (e) {
        failure(e);
      }
    };

    this.reset = function() {
      try {
        web3.reset();
      }
      catch (e) {
        utils.error(e);
      }
    };

    this.getString = function(db, key) {
      return web3.db.getString(db, key);
    };

    this.putString = function(db, key, value) {
      web3.db.putString(db, key, value);
    };

    this.getHex = function(db, key) {
      return web3.db.getHex(db, key);
    };

    this.putHex = function(db, key, value) {
      web3.db.putHex(db, key, value);
    };

    this.getClient = function(callback) {
      web3.version.getClient(function(error, result) {
        if (error) {
          utils.error(error);
        } else {
          callback(result);
        }
      });
    };

    this.getBlock = function(blockNumberOrHash, callback) {
      if (callback)
        web3.eth.getBlock(blockNumberOrHash, function(error, block) {
          if (error) {
            utils.error(error);
          } else {
            callback(block);
          }
        });
      else
        return web3.eth.getBlock(blockNumberOrHash);
    };

    this.getBlockNumber = function(callback) {
      web3.eth.getBlockNumber(function(error, result) {
        if (error) {
          utils.error(error);
        } else {
          callback(result);
        }
      });
    };

    this.getGasPrice = function(callback) {
      web3.eth.getGasPrice(function(error, result) {
        if (error) {
          utils.error(error);
        } else {
          callback(result);
        }
      });
    };

    this.getMining = function(callback) {
      web3.eth.getMining(function(error, result) {
        if (error) {
          utils.error(error);
        } else {
          callback(result);
        }
      });
    };

    this.getHashrate = function(callback) {
      web3.eth.getHashrate(function(error, result) {
        if (error) {
          utils.error(error);
        } else {
          callback(result);
        }
      });
    };

    this.getPeerCount = function(callback) {
      web3.net.getPeerCount(function(error, result) {
        if (error) {
          utils.error(error);
        } else {
          callback(result);
        }
      });
    };


    // Watchers

    this.setAddressWatch = function(flux, address) {
      // ETH balance
      this.filters.address = web3.eth.filter({
        address: address
      }).watch(_.debounce(flux.actions.user.updateBalance, 100, { leading: true }));
    };

    this.setMarketsWatch = function(flux, markets, market) {
      // Watch market's contracts and update sub balances
      // var market_addresses = _.pluck(markets, 'address');
      // for (var i = 0; i < market_addresses.length; i++)
      this.filters.market = web3.eth.filter({
        address: market.address
      }).watch(_.debounce(flux.actions.user.updateBalanceSub, 500));

      this.filters.sub = web3.eth.filter({
        address: params.address
      }).watch(_.debounce(flux.actions.user.updateBalanceSub, 500));

      // Update market and last price
      this.filters.price = web3.eth.filter({
        address: params.address
      }).watch(_.debounce(flux.actions.market.updateMarket, 1000));

      // Watch exchange's address and update sub balances
      this.filters.markets = web3.eth.filter({
        address: params.address
      }).watch(_.debounce(flux.actions.market.updateMarketsBalances, 1000));

      // Watch trades
      this.filters.trades = web3.eth.filter({
        address: params.address,
        toBlock: 'pending',
      }).watch(_.debounce(flux.actions.trade.updateTrades, 5000));

      // Watch pending trades
      // this.filters.pending = web3.eth.filter('pending').watch(flux.actions.trade.checkPending);
    };


    // Loading methods

    this.loadCoinbase = function() {
        return web3.eth.coinbase;
    };

    this.loadAddresses = function(success, failure) {
        try {
            var accounts = web3.eth.accounts;

            if (!accounts || accounts.length === 0)
                failure("No accounts were found on this Ethereum node.");

            success(accounts);
        }
        catch (e) {
            // reject("Unable to load addresses, are you running an Ethereum node? Please load this URL in Mist, AlethZero, or with a geth/eth node running with JSONRPC enabled.");
            utils.error(e);
            failure("Error loading accounts: " + String(e));
        }
    };

    this.getLastMarketID = function(success, failure) {
        try {
            var id = _.parseInt(this.contract.get_last_market_id.call().toString());

            // console.log("LAST MARKET ID: ", last);

            if (!id) {
                failure("No market found, seems like contracts are missing.");
                return;
            }
            success(id);
        }
        catch (e) {
            utils.error(e);
            failure("Unable to load market IDs: " + String(e));
        }
    };

    this.loadMarket = function(id, user, init, progress, favorites, success, failure) {
        try {
            this.contract.get_market.call(id, function(error, market) {
                if (error) {
                  failure("Error loading market " + id + ": " + String(error));
                  return;
                }
                // console.log("Market from ABI:", market);

                // var id = _.parseInt(market[0].toString());
                var name = web3.toAscii(web3.fromDecimal(market[1].toString()));
                var address = web3.fromDecimal(market[2]);
                var decimals = _.parseInt(market[3].toString());
                var precision = _.parseInt(market[4].toString());
                var minimum = _.parseInt(market[5].toString());
                var lastPrice = null;
                if (market[6] != 1)
                    lastPrice = parseFloat(bigRat(market[6].toString()).divide(bigRat(Math.pow(10, market[4].toString().length - 1))).toDecimal());
                var owner = web3.fromDecimal(market[7]);
                var block = _.parseInt(market[8].toString());
                var total_trades = _.parseInt(market[9].toString());
                var category = _.parseInt(market[10].toString());

                // console.log(id, name, address, decimals, precision, minimum, category, lastPrice, owner, block, total_trades);

                var SubContractABI = web3.eth.contract(abi.sub);
                var subcontract = SubContractABI.at(address);
                var balance = subcontract.balance.call(user.id).toString();

                var favorite = false;
                if (favorites && _.indexOf(favorites, id) >= 0)
                    favorite = true;

                var amountPrecision = (1 / Math.pow(10, decimals)).toFixed(decimals);
                var priceDecimals = String(precision).length - 1;
                var pricePrecision = (1 / _.parseInt(precision)).toFixed(priceDecimals);
                var minimumTotal = bigRat(minimum).divide(fixtures.ether).valueOf().toFixed(priceDecimals);

                success({
                    id: id,
                    name: name,
                    address: address,
                    category: category,
                    decimals: decimals,
                    minimum: minimum,
                    precision: precision,
                    amountPrecision: amountPrecision,
                    pricePrecision: pricePrecision,
                    priceDecimals: priceDecimals,
                    minimumTotal: minimumTotal,
                    lastPrice: lastPrice,
                    owner: owner,
                    block: block,
                    total_trades: total_trades,
                    balance: _.parseInt(balance),
                    favorite: favorite
                });

                if (progress)
                  progress(init);
            });
        }
        catch(e) {
            failure("Unable to load market " + id + ": " + String(e));
        }
    };

    this.loadTradeIDs = function(market, success, failure) {
        try {
            // web3.eth.defaultBlock = 'pending';
            this.contract.get_trade_ids.call(market.id, 'pending', function(error, trade_ids) {
                if (error) {
                    failure("Error loading trade IDs: " + String(error));
                    utils.error(error);
                    return;
                }

                if (!trade_ids || trade_ids.length === 0) {
                    failure("No trades found");
                    return;
                }
                var tradeIDs = _.map(trade_ids, function(trade) {
                  return web3.fromDecimal(trade);
                });

                success(tradeIDs);
            });
        }
        catch (e) {
            failure("Unable to load trade IDs: " + String(e));
            utils.error(e);
        }
    };

    this.loadTrades = function(trade_ids, market, progress, success, failure) {
        try {
            // var trade_ids = this.contract.get_trade_ids.call(market.id, 'pending');

            // if (params.debug)
            //   utils.log("TRADE_IDS", _.map(trade_ids, function(trade) {
            //     return web3.fromDecimal(trade);
            //   }));

            if (!trade_ids || trade_ids.length === 0) {
                failure("No trades found");
                return;
            }

            for (var i = trade_ids.length - 1; i >= 0; i--)
                this.loadTrade(trade_ids[i], market, progress, success, failure);
        }
        catch (e) {
            failure("Unable to load trades: " + String(e));
        }
    };

    this.loadTrade = function(id, market, progress, success, failure) {
        this.contract.get_trade.call(id, 'pending', function(error, trade) {
            // utils.log("Trade from ABI:", trade);
            if (error) {
              // Update progress
              // currentProgress.current += 1;
              // progress(currentProgress);
              progress();
              failure("Error loading trade: " + String(error));
              utils.error(error);
              return;
            }

            try {
                var tradeId = web3.fromDecimal(trade[0]); //.replace('-', '');
                var ref = web3.fromDecimal(trade[7]); //.replace('-', '');

                // Resolve on filled trades
                if (tradeId == "0x0" || ref == "0x0") {
                    // Update progress
                    // currentProgress.current += 1;
                    // progress(currentProgress);
                    progress();
                    return;
                }

                var status = 'mined';

                var tradeExists = web3.eth.getStorageAt(params.address, ref, 'latest');

                // if (params.debug) {
                //     utils.log("EXISTS", tradeId);
                //     utils.log(tradeExists, ref);
                // }

                if (tradeExists === null || tradeExists == "0x0" || tradeExists == "0x0000000000000000000000000000000000000000000000000000000000000000")
                    status = 'pending';
                else
                    status = 'mined';

                var type = _.parseInt(trade[1].toString());
                // var marketid = _.parseInt(trade[2].toString());
                var amountPrecision = Math.pow(10, market.decimals);
                var precision = market.precision;

                // console.log("Loading trade " + id + " for market " + market.name);

                var amount = bigRat(trade[3].toString()).divide(amountPrecision).valueOf();
                var price = bigRat(trade[4].toString()).divide(precision).valueOf();

                success({
                    id: tradeId,
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

                // Update progress
                // currentProgress.current += 1;
                progress();
            }
            catch(e) {
                failure("Failed to load trade " + web3.fromDecimal(id) + ": " + String(e));
                utils.error("TRADE", e);
            }
        });
    };

    this.watchPrices = function(market, success, failure) {
        // console.log("Loading prices...");
        var toBlock = web3.eth.blockNumber;
        if (params.rangeEnd)
          toBlock = params.rangeEnd;
        var fromBlock = toBlock - (toBlock >= params.range ? params.range : 0);
        if (fromBlock == toBlock)
          fromBlock = 0;

        try {
            // Unload previous filter
            if (this.filters.prices)
              this.filters.prices.stopWatching();

            this.filters.prices = this.contract.log_price({
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              if (error) {
                failure("Error loading prices: " + String(error));
                return;
              }
              // utils.log("PRICE CHANGE: ", log);

              var amountPrecision = Math.pow(10, market.decimals);
              var precision = market.precision;

              // for (var i = logs.length - 1; i >= 0; i--) {
              var price = {
                  timestamp: _.parseInt(web3.toDecimal(log.args.timestamp)),
                  type: _.parseInt(web3.toDecimal(log.args.type)),
                  price: bigRat(web3.toDecimal(log.args.price)).divide(precision).valueOf(),
                  amount: bigRat(web3.toDecimal(log.args.amount)).divide(amountPrecision).valueOf()
              };
              // }
              // console.log("PRICES", prices);

              success(price);
          });
        }
        catch (e) {
            failure("Unable to load prices: " + String(e));
        }
    };

    this.watchTransactions = function(user, market, success, failure) {
        // console.log("Loading transactions...");
        var toBlock = web3.eth.blockNumber;
        if (params.rangeEnd)
          toBlock = params.rangeEnd;
        var fromBlock = toBlock - (toBlock > params.range ? params.range : 0);
        if (fromBlock == toBlock)
          fromBlock = 0;

        try {
            var amount = '';
            var price = '';
            var total = '';

            // Get deposits
            if (this.filters.deposits)
              this.filters.deposits.stopWatching();
            this.filters.deposits = this.contract.log_deposit({
              sender: user.id,
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              // console.log("TRANSACTION: ", log);
              // Refilter... TODO remove once market is indexed / properly filtered
              if (market.id == _.parseInt(log.args.market.valueOf()))
                success({
                  hash: log.transactionHash || log.hash,
                  type: 'deposit',
                  number: log.number,
                  block: log.blockNumber,
                  inout: 'out',
                  from: web3.fromDecimal(log.args.sender),
                  to: params.address,
                  amount: log.args.amount.valueOf(),
                  market: _.parseInt(log.args.market.valueOf()),
                  price: 'N/A',
                  total: 'N/A',
                  result: 'OK'
                });
            });

            // Get withdrawals
            if (this.filters.withdrawals)
              this.filters.withdrawals.stopWatching();
            this.filters.withdrawals = this.contract.log_withdraw({
              address: user.id,
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              // console.log("TRANSACTION: ", log);
              // Refilter... TODO remove once market is indexed / properly filtered
              if (market.id == _.parseInt(log.args.market.valueOf()))
                success({
                  hash: log.transactionHash || log.hash,
                  type: 'withdraw',
                  number: log.number,
                  block: log.blockNumber,
                  inout: 'in',
                  from: params.address,
                  to: web3.fromDecimal(log.args.address),
                  amount: log.args.amount.valueOf(),
                  market: _.parseInt(log.args.market.valueOf()),
                  price: 'N/A',
                  total: 'N/A',
                  result: 'OK'
                });
            });

            // Get cancelations
            if (this.filters.cancels)
              this.filters.cancels.stopWatching();
            this.filters.cancels = this.contract.log_cancel({
              sender: user.id,
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              // console.log("TRANSACTION: ", log);
              amount = log.args.amount.valueOf();
              price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
              total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

              // Refilter... TODO remove once market is indexed / properly filtered
              if (market.id == _.parseInt(log.args.market.valueOf()))
                success({
                  hash: log.transactionHash || log.hash,
                  type: 'cancel',
                  number: log.number,
                  block: log.blockNumber,
                  inout: 'in',
                  from: web3.fromDecimal(log.args.sender),
                  to: params.address,
                  amount: amount,
                  market: _.parseInt(log.args.market.valueOf()),
                  price: price,
                  total: utils.formatBalance(total),
                  result: 'OK'
                });
            });

            // Get added trades
            if (this.filters.adds)
              this.filters.adds.stopWatching();
            this.filters.adds = this.contract.log_add_tx({
              sender: user.id,
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              // console.log("TRANSACTION: ", log);
              amount = log.args.amount.valueOf();
              price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
              total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

              // Refilter... TODO remove once market is indexed / properly filtered
              if (market.id == _.parseInt(log.args.market.valueOf()))
                success({
                  hash: log.transactionHash || log.hash,
                  type: log.args.type.valueOf() == 1 ? 'buy' : 'sell',
                  number: log.number,
                  block: log.blockNumber,
                  // inout: (_.parseInt(web3.toDecimal(log.args.type)) == 1 ? 'in' : 'out'),
                  inout: 'out',
                  from: web3.fromDecimal(log.args.sender),
                  to: params.address,
                  amount: amount,
                  market: _.parseInt(log.args.market.valueOf()),
                  price: price,
                  total: utils.formatBalance(total),
                  result: 'OK'
                });
            });

            // Get filled trades
            if (this.filters.fills)
              this.filters.fills.stopWatching();
            this.filters.fills = this.contract.log_fill_tx({
              sender: user.id,
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              // console.log("TRANSACTION: ", log);
              amount = log.args.amount.valueOf();
              price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
              total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

              // Refilter... TODO remove once market is indexed / properly filtered
              if (market.id == _.parseInt(log.args.market.valueOf()))
                success({
                  hash: log.transactionHash || log.hash,
                  type: log.args.type.valueOf() == 1 ? 'bought' : 'sold',
                  number: log.number,
                  block: log.blockNumber,
                  inout: log.args.type.valueOf() == 1 ? 'in' : 'out',
                  from: web3.fromDecimal(log.args.sender),
                  to: params.address,
                  amount: amount,
                  market: _.parseInt(log.args.market.valueOf()),
                  price: price,
                  total: utils.formatBalance(total),
                  result: 'OK'
                });
            });

            // Get trades filled by others
            if (this.filters.ownFilled)
              this.filters.ownFilled.stopWatching();
            this.filters.ownFilled = this.contract.log_fill_tx({
              owner: user.id,
              market: market.id
            }, {
              fromBlock: fromBlock,
              toBlock: toBlock
            }).watch( function(error, log) {
              // console.log("TRANSACTION: ", log);
              amount = log.args.amount.valueOf();
              price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
              total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

              // Refilter... TODO remove once owner/market is indexed / properly filtered
              if (user.id == web3.fromDecimal(log.args.owner) && market.id == _.parseInt(log.args.market.valueOf()))
                  success({
                    hash: log.transactionHash || log.hash,
                    type: log.args.type.valueOf() == 1 ? 'sold' : 'bought',
                    number: log.number,
                    block: log.blockNumber,
                    inout: log.args.type.valueOf() == 1 ? 'out' : 'in',
                    from: web3.fromDecimal(log.args.sender),
                    to: params.address,
                    amount: amount,
                    market: _.parseInt(log.args.market.valueOf()),
                    price: price,
                    total: utils.formatBalance(total),
                    result: 'OK'
                  });
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
            web3.eth.getBalance(address, function(error, hexbalance) {
                if (error) {
                    failure(error);
                    return;
                }
                // console.log("BALANCE", hexbalance.toString());

                if (!hexbalance || hexbalance == "0x") {
                    success(0, false);
                    return;
                }
                var balance = web3.toDecimal(hexbalance);
                success(balance, false);
            });
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
            var SubContractABI = web3.eth.contract(abi.sub);
            var subcontract = SubContractABI.at(market.address);
            var sub_balance = subcontract.balance.call(address).toString();

            this.contract.get_sub_balance.call(address, market.id, function(error, balances) {
                if (error) {
                    failure(error);
                    return;
                }

                var available = balances[0].toString();
                var trading = balances[1].toString();

                if (!sub_balance || sub_balance == "0")
                    sub_balance = 0;
                if (!available || available == "0")
                    available = 0;
                if (!trading || trading == "0")
                    trading = 0;

                if (!available && !trading && !sub_balance) {
                    success(market, 0, 0, 0);
                    return;
                }

                if (sub_balance)
                    sub_balance = bigRat(sub_balance).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();
                if (available)
                    available = bigRat(available).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();
                if (trading)
                    trading = bigRat(trading).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();

                success(market, available, trading, sub_balance);
            });
        }
        catch(e) {
            failure(error + String(e));
        }
    };


    // Ether actions

    this.sendEther = function(user, amount, recipient, success, failure) {
        try {
          var options = {
            from: user.id,
            to: recipient,
            value: amount
          };
          var result = web3.eth.sendTransaction(options);

          success(result);
        }
        catch(e) {
          failure(String(e));
        }
    };


    // Sub actions

    this.sendSub = function(user, amount, recipient, market, success, failure) {
        var SubContractABI = web3.eth.contract(abi.sub);
        var subcontract = SubContractABI.at(market.address);

        try {
            var options = {
                from: user.id,
                to: market.address,
                gas: "100000"
            };
            var result = subcontract.transfer.sendTransaction(recipient, amount, options);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.depositSub = function(user, amount, market, success, failure) {
        var SubContractABI = web3.eth.contract(abi.sub);
        var subcontract = SubContractABI.at(market.address);

        try {
            var options = {
                from: user.id,
                to: market.address,
                gas: "250000"
            };
            var result = subcontract.transfer.sendTransaction(params.address, amount, options);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.withdrawSub = function(user, amount, market, success, failure) {
        try {
            var options = {
                from: user.id,
                to: market.address,
                gas: "250000"
            };
            var result = this.contract.withdraw.sendTransaction(amount, market.id, options);

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.registerMarket = function(user, market, success, failure) {
        try {
            var options = {
                from: user.id,
                to: params.address,
                gas: "250000"
            };
            var result = this.contract.add_market.sendTransaction(
                web3.fromAscii(market.name, 32),
                market.address,
                market.decimals,
                market.precision,
                market.minimum,
                market.category,
                options
            );

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };


    // Trade actions

    this.addTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        try {
            var options = {
                from: user.id,
                value: trade.type == 1 ? amounts.total : "0",
                to: params.address,
                gas: "500000"
            };

            var result = false;
            if (trade.type == 1)
                result = this.contract.buy.sendTransaction(amounts.amount, amounts.price, trade.market, options);
            else if (trade.type == 2)
                result = this.contract.sell.sendTransaction(amounts.amount, amounts.price, trade.market, options);
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
        }

        var ids = _.pluck(trades, 'id');
        var gas = ids.length * 250000;

        try {
            var result = this.contract.trade.sendTransaction(total_amounts, ids, {
                from: user.id,
                to: params.address,
                value: total > 0 ? total.toString() : "0",
                gas: String(gas)
            });

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.fillTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        try {
            var result = this.contract.trade.sendTransaction(amounts.amount, [trade.id], {
                from: user.id,
                gas: "250000",
                to: params.address,
                value: trade.type == "sells" ? amounts.total : "0"
            });

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.cancelTrade = function(user, trade, success, failure) {
        try {
            var result = this.contract.cancel.sendTransaction(trade.id, {
                from: user.id,
                value: "0",
                to: params.address,
                gas: "250000"
            });

            success(result);
        }
        catch(e) {
            failure(String(e));
        }
    };

    this.estimateAddTrade = function(user, trade, market, success, failure) {
        var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

        try {
            var options = {
                from: user.id,
                value: trade.type == 1 ? amounts.total : "0",
                to: params.address,
                gas: "500000"
            };

            var result = false;
            if (trade.type == 1)
                result = this.contract.buy.estimateGas(amounts.amount, amounts.price, trade.market, options) / 10;
            else if (trade.type == 2)
                result = this.contract.sell.estimateGas(amounts.amount, amounts.price, trade.market, options) / 10;
            else {
                failure("Invalid trade type.");
                return;
            }

            success(result);
        }
        catch(e) {
            utils.error(e);
            failure(String(e));
        }
    };

    this.estimateFillTrades = function(user, trades, market, success, failure) {
        var total = bigRat(0);
        var total_amounts = bigRat(0);

        for (var i = trades.length - 1; i >= 0; i--) {
            var amounts = this.getAmounts(trades[i].amount, trades[i].price, market.decimals, market.precision);

            if (trades[i].type == 'sells')
                total += bigRat(amounts.total);

            total_amounts += bigRat(amounts.amount);
        }

        var ids = _.pluck(trades, 'id');
        var gas = ids.length * 250000;

        try {
            var result = this.contract.trade.estimateGas(total_amounts, ids, {
                from: user.id,
                to: params.address,
                value: total > 0 ? total.toString() : "0",
                gas: String(gas)
            });

            success(result / 10);
        }
        catch(e) {
            utils.error(e);
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
        };
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
