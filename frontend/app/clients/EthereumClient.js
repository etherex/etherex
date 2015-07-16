var _ = require("lodash");
var utils = require("../js/utils");
var fixtures = require("../js/fixtures");
var abi = require("../js/abi");
var web3 = require('web3');

var bigRat = require('big-rational');

// web3.padDecimal = function (string, chars) {
//     string = web3.fromDecimal(string).substr(2);
//     return Array(chars - string.length + 1).join("0") + string;
// };

var EthereumClient = function(params) {
  try {
    web3.setProvider(new web3.providers.HttpProvider('//' + params.host));

    var ContractABI = web3.eth.contract(abi.etherex);
    this.contract = ContractABI.at(params.address);

    if (params.error)
      web3.eth.getCode(params.address, function(error, result) {
        if (error)
          utils.error(error);
        if (error || result == "0x")
          params.error("Unable to find contract!");
      });

    this.address = params.address;
    this.debug = params.debug;
    this.flux = params.flux;
    this.filters = {
      blocks: null,
      address: null,
      pending: null,
      prices: {},
      deposits: {},
      withdrawals: {},
      cancellations: {},
      adds: {},
      fills: {},
      fillsOwn: {}
    };
    this.range = params.range;
    this.rangeEnd = params.rangeEnd;

    // fromBlock / toBlock
    var toBlock = 'latest';
    var toBlockNumber = web3.eth.blockNumber;
    if (this.rangeEnd !== 0)
      toBlock = this.rangeEnd;
    var fromBlock = toBlockNumber - (toBlockNumber >= this.range ? this.range : 0);
    if (fromBlock >= toBlock || fromBlock < 0)
      fromBlock = 0;

    this.fromBlock = fromBlock;
    this.toBlock = toBlock;
  }
  catch(e) {
    utils.error("web3 error: ", e);
  }

  this.isAvailable = function() {
    // attempt an RPC call that should fail if the daemon is unreachable.
    try {
      return web3.net.listening;
    } catch(err) {
      return false;
    }
  };

  this.watchNewBlock = function(callback) {
    if (this.debug)
      utils.log("WATCHING", "BLOCKS");

    var onNewBlock = _.debounce( function (err, log) {
      if (err)
        utils.error(err);
      if (log)
        callback(err, log);
    }, 1000, {
      leading: true,
      trailing: true
    });

    if (this.filters.blocks)
      this.filters.blocks.stopWatching();
    this.filters.blocks = web3.eth.filter('latest').watch(onNewBlock);
  };

  this.watchAddress = function(address) {
    if (this.debug)
      utils.log("WATCHING", address);

    if (this.filters.address)
      this.filters.address.stopWatching();

    var updateBalance = _.debounce(this.flux.actions.user.updateBalance, 1000, {
      leading: true,
      trailing: true
    });

    // ETH balance
    this.filters.address = web3.eth.filter('latest').watch(updateBalance);
  };

  // TODO
  // this.watchPending = function() {
  //   Watch pending trades
  //   this.filters.pending = web3.eth.filter('pending').watch(flux.actions.trade.checkPending);
  // };

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

      if (this.debug)
        utils.log("LAST MARKET ID: ", id);

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

  this.loadMarket = function(id, user, favorites, success, failure) {
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
        var totalTrades = _.parseInt(market[9].toString());
        var category = _.parseInt(market[10].toString());

        // console.log(id, name, address, decimals, precision, minimum, category, lastPrice, owner, block, totalTrades);

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
          totalTrades: totalTrades,
          balance: _.parseInt(balance),
          favorite: favorite,
          dayChange: '-',
          weekChange: '-',
          monthChange: '-'
        });
      });
    }
    catch(e) {
      failure("Unable to load market " + id + ": " + String(e));
    }
  };

  this.loadTradeIDs = function(market, success, failure) {
    try {
      // web3.eth.defaultBlock = 'pending';
      this.contract.get_trade_ids.call(market.id, 'pending', function(error, tradeIDs) {
        if (error) {
          failure("Error loading trade IDs: " + String(error));
          utils.error(error);
          return;
        }

        if (!tradeIDs || tradeIDs.length === 0) {
          failure("No trades found");
          return;
        }
        var mappedIDs = _.map(tradeIDs, function(id) {
          return web3.fromDecimal(id);
        });

        success(mappedIDs);
      });
    }
    catch (e) {
      failure("Unable to load trade IDs: " + String(e));
      utils.error(e);
    }
  };

  this.loadTrade = function(id, market, progress, success, failure) {
    this.contract.get_trade.call(id, 'pending', function(error, trade) {
      if (error) {
        if (progress)
          progress();
        utils.error(error);
        failure("Error loading trade: " + String(error));
        return;
      }

      try {
        var tradeId = web3.fromDecimal(trade[0]);
        var ref = web3.fromDecimal(trade[7]);

        // Resolve on filled/cancelled trades when loading
        if (tradeId == "0x0" || ref == "0x0") {
          if (progress) {
            progress();
            return;
          }
          else {
            if (this.debug)
              utils.log("REMOVED", id);
            success({
              id: id,
              amount: 0
            });
            return;
          }
        }

        var status = 'mined';

        // TODO this is screwed up again...
        // var tradeExists = web3.eth.getStorageAt(this.address, ref, 'latest');
        // if (this.debug) {
        //     utils.log("THIS TRADE", tradeId);
        //     utils.log("REF", ref);
        //     utils.log("EXISTS", tradeExists);
        //     utils.log(tradeExists, ref);
        // }
        // if (tradeExists === null ||
        //     tradeExists == "0x0" ||
        //     tradeExists == "0x0000000000000000000000000000000000000000000000000000000000000000" ||
        //     tradeExists != ref)
        //     status = 'pending';
        // else
        //     status = 'mined';

        var type = _.parseInt(trade[1].toString());

        var amountPrecision = Math.pow(10, market.decimals);
        var precision = market.precision;

        var amount = bigRat(trade[3].toString()).divide(amountPrecision).valueOf();
        var price = bigRat(trade[4].toString()).divide(precision).valueOf();

        trade = {
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
        };

        if (this.debug)
          utils.log("LOADED", trade);

        success(trade);

        // Update progress
        if (progress)
          progress();
      }
      catch(e) {
        utils.error("LOAD TRADE ERROR", e);
        failure("Failed to load trade " + web3.fromDecimal(id) + ": " + String(e));
      }
    }.bind(this));
  };


  //
  // Watchers
  //
  this.watchPrices = function(market, success, failure) {
    if (this.debug)
      utils.log("WATCHING", market.name + " PRICES");

    var updateLastPrice = _.debounce( function(price) {
      this.flux.actions.market.updateLastPrice(market.id, price);
    }.bind(this), 1000, {
      leading: true,
      trailing: true
    });

    try {
      // Unload previous filter
      if (_.has(this.filters.prices, market.name))
        this.filters.prices[market.name].stopWatching();

      this.filters.prices[market.name] = this.contract.log_price({
          market: market.id
      }, {
          fromBlock: this.fromBlock,
          toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading price: " + String(error));
          return;
        }
        if (this.debug)
          utils.log("PRICE CHANGE: ", log);

        var amountPrecision = Math.pow(10, market.decimals);
        var precision = market.precision;
        var price = bigRat(web3.toDecimal(log.args.price)).divide(precision).valueOf();

        // Update current market's prices only
        var currentMarket = this.flux.store("MarketStore").getState().market;
        if (market.id != currentMarket.id)
          return;

        // Update current market's last price
        var trades = this.flux.store("TradeStore").getState();
        if (!trades.loading && !trades.updating && this.toBlock == 'latest')
          updateLastPrice(price);

        var priceLog = {
          timestamp: _.parseInt(web3.toDecimal(log.args.timestamp)),
          type: _.parseInt(web3.toDecimal(log.args.type)),
          price: price,
          amount: bigRat(web3.toDecimal(log.args.amount)).divide(amountPrecision).valueOf()
        };

        success(priceLog);
      }.bind(this));
    }
    catch (e) {
      utils.error(e);
      failure("Unable to load prices: " + String(e));
    }
  };

  this.watchTransactions = function(user, market, success, failure) {
    if (this.debug)
      utils.log("WATCHING", market.name + " TRANSACTIONS");

    var updateSubBalance = _.debounce( function() {
      this.flux.actions.user.updateBalanceSub(market);
    }.bind(this), 1000, {
      leading: true,
      trailing: true
    });

    var amount = null;
    var price = null;
    var total = null;

    try {
      //
      // Deposit
      //
      if (_.has(this.filters.deposits, market.name))
        this.filters.deposits[market.name].stopWatching();

      this.filters.deposits[market.name] = this.contract.log_deposit({
        market: market.id,
        sender: user.id
      }, {
        fromBlock: this.fromBlock,
        toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading deposit: " + String(error));
          return;
        }

        if (this.debug)
          utils.log("NEW DEPOSIT: ", log);

        // Update user's sub balance for that market
        var markets = this.flux.store("MarketStore").getState();
        if (!markets.loading && this.toBlock == 'latest')
          updateSubBalance(market);

        // Update current market's deposits only
        var currentMarket = this.flux.store("MarketStore").getState().market;
        if (market.id != currentMarket.id)
          return;

        success({
          hash: log.transactionHash,
          type: 'deposit',
          number: log.number,
          block: log.blockNumber,
          inout: 'out',
          from: web3.fromDecimal(log.args.sender),
          to: this.address,
          amount: log.args.amount.valueOf(),
          market: _.parseInt(log.args.market.valueOf()),
          price: false,
          total: false,
          details: '+'
        });
      }.bind(this));

      //
      // Withdrawal
      //
      if (_.has(this.filters.withdrawals, market.name))
        this.filters.withdrawals[market.name].stopWatching();

      this.filters.withdrawals[market.name] = this.contract.log_withdraw({
        market: market.id,
        sender: user.id
      }, {
        fromBlock: this.fromBlock,
        toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading withdrawal: " + String(error));
          return;
        }

        if (this.debug)
          utils.log("NEW WITHDRAWAL: ", log);

        // Update user's sub balance for that market
        var markets = this.flux.store("MarketStore").getState();
        if (!markets.loading && this.toBlock == 'latest')
          updateSubBalance(market);

        // Update current market's withdrawals only
        if (market.id != markets.market.id)
          return;

        success({
          hash: log.transactionHash,
          type: 'withdraw',
          number: log.number,
          block: log.blockNumber,
          inout: 'in',
          from: this.address,
          to: web3.fromDecimal(log.args.address),
          amount: log.args.amount.valueOf(),
          market: _.parseInt(log.args.market.valueOf()),
          price: false,
          total: false,
          details: '+'
        });
      }.bind(this));

      //
      // Cancellation
      //
      if (_.has(this.filters.cancellations, market.name))
        this.filters.cancellations[market.name].stopWatching();

      this.filters.cancellations[market.name] = this.contract.log_cancel({
        market: market.id
      }, {
        fromBlock: this.fromBlock,
        toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading cancellation: " + String(error));
          return;
        }

        if (this.debug)
          utils.log("NEW CANCELLATION: ", log);

        // Update user's sub balance and ether balance
        var markets = this.flux.store("MarketStore").getState();
        if (!markets.loading && market.id == markets.market.id)
          updateSubBalance(market);

        // Update current market's trades only
        if (market.id != markets.market.id)
          return;

        // Update trade
        var id = web3.fromDecimal(log.args.tradeid);
        var trades = this.flux.store("TradeStore").getState();
        if (!trades.loading && this.toBlock == 'latest') {
          this.flux.actions.trade.updateTrade(id, market);
        }

        // List only user's transactions
        var sender = web3.fromDecimal(log.args.sender);
        if (sender != user.id)
          return;

        amount = log.args.amount.valueOf();
        price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
        total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

        success({
          id: id,
          hash: log.transactionHash,
          type: 'cancel',
          number: log.number,
          block: log.blockNumber,
          inout: 'in',
          from: sender,
          to: this.address,
          amount: amount,
          market: _.parseInt(log.args.market.valueOf()),
          price: price,
          total: utils.formatEther(total),
          details: '+'
        });
      }.bind(this));

      //
      // Added trade
      //
      if (_.has(this.filters.adds, market.name))
        this.filters.adds[market.name].stopWatching();

      this.filters.adds[market.name] = this.contract.log_add_tx({
        market: market.id
      }, {
        fromBlock: this.fromBlock,
        toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading new trade: " + String(error));
          return;
        }

        if (this.debug)
          utils.log("NEW TRADE: ", log);

        // Update user's sub balance
        var sender = web3.fromDecimal(log.args.sender);
        var markets = this.flux.store("MarketStore").getState();
        if (!markets.loading && this.toBlock == 'latest' && sender == user.id)
          updateSubBalance(market);

        // Update current market's trades only
        if (market.id != markets.market.id)
          return;

        // Update trade
        var trades = this.flux.store("TradeStore").getState();
        // Try not to re-add already loaded trades, we also have to check in
        // ADD_TRADE_SUCCESS when switching markets, as the transactions get
        // loaded after trades
        var id = web3.fromDecimal(log.args.tradeid);
        if (!trades.loading && !trades.updating && this.toBlock == 'latest') {
          this.flux.actions.trade.addTradeSuccess(id, market, false);
        }

        // List only user's transactions
        if (sender != user.id)
          return;

        amount = log.args.amount.valueOf();
        price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
        total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

        success({
          id: id,
          hash: log.transactionHash,
          type: log.args.type.valueOf() == 1 ? 'buy' : 'sell',
          number: log.number,
          block: log.blockNumber,
          // inout: (_.parseInt(web3.toDecimal(log.args.type)) == 1 ? 'in' : 'out'),
          inout: 'out',
          from: sender,
          to: this.address,
          amount: amount,
          market: _.parseInt(log.args.market.valueOf()),
          price: price,
          total: utils.formatEther(total),
          details: '+'
        });
      }.bind(this));

      //
      // Filled trade by user
      //
      if (_.has(this.filters.fills, market.name))
        this.filters.fills[market.name].stopWatching();

      this.filters.fills[market.name] = this.contract.log_fill_tx({
        sender: user.id,
        market: market.id
      }, {
        fromBlock: this.fromBlock,
        toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading filled trade: " + String(error));
          return;
        }

        if (this.debug)
          utils.log("FILLED TRADE: ", log);

        // Update user's sub balance
        var markets = this.flux.store("MarketStore").getState();
        if (!markets.loading && this.toBlock == 'latest')
          updateSubBalance(market);

        // Update current market's trades only
        if (market.id != markets.market.id)
          return;

        // Update trade
        var id = web3.fromDecimal(log.args.tradeid);
        var trades = this.flux.store("TradeStore").getState();
        if (!trades.loading && !trades.updating) {
          if (this.debug)
            utils.log("UPDATING", id);
          this.flux.actions.trade.updateTrade(id, market);
        }

        // List only user's transactions
        var sender = web3.fromDecimal(log.args.sender);
        if (sender != user.id)
          return;

        amount = log.args.amount.valueOf();
        price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
        total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

        success({
          id: id,
          hash: log.transactionHash,
          type: log.args.type.valueOf() == 1 ? 'bought' : 'sold',
          number: log.number,
          block: log.blockNumber,
          inout: log.args.type.valueOf() == 1 ? 'in' : 'out',
          from: sender,
          to: this.address,
          amount: amount,
          market: _.parseInt(log.args.market.valueOf()),
          price: price,
          total: utils.formatEther(total),
          details: '+'
        });
      }.bind(this));

      //
      // Trade filled by another user
      //
      if (_.has(this.filters.fillsOwn, market.name))
        this.filters.fillsOwn[market.name].stopWatching();

      this.filters.fillsOwn[market.name] = this.contract.log_fill_tx({
        owner: user.id,
        market: market.id
      }, {
        fromBlock: this.fromBlock,
        toBlock: this.toBlock
      }).watch( function(error, log) {
        if (error) {
          utils.error(error);
          failure("Error loading trade filled: " + String(error));
          return;
        }

        // TODO remove once filtering works properly
        if (market.id != _.parseInt(log.args.market.valueOf()))
          return;

        if (this.debug)
          utils.log("TRADE FILLED: ", log);

        // Update user's sub balance
        var markets = this.flux.store("MarketStore").getState();
        if (!markets.loading && this.toBlock == 'latest') {
          updateSubBalance(market);

          var alerts = this.flux.store('config').alertCount;
          this.flux.actions.config.updateAlertCount(alerts + 1);
        }

        // Update current market's trades only
        if (market.id != markets.market.id)
          return;

        // Update trade
        var id = web3.fromDecimal(log.args.tradeid);
        var trades = this.flux.store("TradeStore").getState();
        if (!trades.loading && !trades.updating) {
          this.flux.actions.trade.updateTrade(id, market);
        }

        // List only user's transactions
        var sender = web3.fromDecimal(log.args.sender);
        if (sender != user.id)
          return;

        amount = log.args.amount.valueOf();
        price = bigRat(log.args.price.valueOf()).divide(market.precision).valueOf();
        total = bigRat(amount).divide(Math.pow(10, market.decimals)).multiply(price).multiply(fixtures.ether);

        success({
          id: id,
          hash: log.transactionHash,
          type: log.args.type.valueOf() == 1 ? 'sold' : 'bought',
          number: log.number,
          block: log.blockNumber,
          inout: log.args.type.valueOf() == 1 ? 'out' : 'in',
          from: sender,
          to: this.address,
          amount: amount,
          market: _.parseInt(log.args.market.valueOf()),
          price: price,
          total: utils.formatEther(total),
          details: '+'
        });
      }.bind(this));
    }
    catch (e) {
      utils.error(e);
      failure("Unable to load transaction: " + String(e));
    }
  };

  //
  // Balances
  //
  this.updateBalance = function(address, success, failure) {
    var errorStr = "Failed to update balance: ";

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
      failure(errorStr + String(e));
    }
  };

  this.updateBalanceSub = function(market, address, success, failure) {
    var errorStr = "Failed to update subcurrency balance: ";

    if (!market || !address)
      return;

    try {
      var SubContractABI = web3.eth.contract(abi.sub);
      var subcontract = SubContractABI.at(market.address);
      var subBalance = subcontract.balance.call(address).toString();

      this.contract.get_sub_balance.call(address, market.id, function(error, balances) {
        if (error) {
          failure(error);
          return;
        }

        var available = balances[0].toString();
        var trading = balances[1].toString();

        if (!subBalance || subBalance == "0")
          subBalance = 0;
        if (!available || available == "0")
          available = 0;
        if (!trading || trading == "0")
          trading = 0;

        if (!available && !trading && !subBalance) {
          success(market, 0, 0, 0);
          return;
        }

        if (subBalance)
          subBalance = bigRat(subBalance).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();
        if (available)
          available = bigRat(available).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();
        if (trading)
          trading = bigRat(trading).divide(bigRat(String(Math.pow(10, market.decimals)))).valueOf();

        success(market, available, trading, subBalance);
      });
    }
    catch(e) {
      utils.error(e);
      failure(errorStr + String(e));
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
        gas: "150000"
      };
      var result = subcontract.transfer.sendTransaction(this.address, amount, options);

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
        gas: "150000"
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
        to: this.address,
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
        to: this.address,
        gas: "350000"
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
    var total = bigRat(0);
    var totalAmounts = bigRat(0);

    for (var i = trades.length - 1; i >= 0; i--) {
      var amounts = this.getAmounts(trades[i].amount, trades[i].price, market.decimals, market.precision);

      if (trades[i].type == 'sells')
        total += bigRat(amounts.total);

      totalAmounts += bigRat(amounts.amount);
    }

    var ids = _.pluck(trades, 'id');
    var gas = ids.length * 250000;

    try {
      var result = this.contract.trade.sendTransaction(totalAmounts, ids, {
        from: user.id,
        to: this.address,
        value: total > 0 ? total.toString() : "0",
        gas: String(gas)
      });

      success(result);
    }
    catch(e) {
      utils.error(e);
      failure(String(e));
    }
  };

  this.fillTrade = function(user, trade, market, success, failure) {
    var amounts = this.getAmounts(trade.amount, trade.price, market.decimals, market.precision);

    try {
      var result = this.contract.trade.sendTransaction(amounts.amount, [trade.id], {
        from: user.id,
        gas: "250000",
        to: this.address,
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
        to: this.address,
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
        to: this.address,
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
    var totalAmounts = bigRat(0);

    for (var i = trades.length - 1; i >= 0; i--) {
      var amounts = this.getAmounts(trades[i].amount, trades[i].price, market.decimals, market.precision);

      if (trades[i].type == 'sells')
        total += bigRat(amounts.total);

      totalAmounts += bigRat(amounts.amount);
    }

    var ids = _.pluck(trades, 'id');
    var gas = ids.length * 250000;

    try {
      var result = this.contract.trade.estimateGas(totalAmounts, ids, {
        from: user.id,
        to: this.address,
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

  //
  // Utilities
  //
  this.getAmounts = function(amount, price, decimals, precision) {
    var bigamount = bigRat(amount).multiply(bigRat(Math.pow(10, decimals))).floor(true).toString();
    var bigprice = bigRat(price).multiply(bigRat(precision)).floor(true).toString();
    var total = bigRat(amount)
                  .multiply(price)
                  .multiply(bigRat(fixtures.ether)).floor(true).toString();

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
