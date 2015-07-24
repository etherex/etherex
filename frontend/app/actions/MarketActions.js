var _ = require("lodash");
var utils = require("../js/utils");
var constants = require("../js/constants");
var web3 = require("web3");

var MarketActions = function() {

  this.initializeMarkets = function() {
    if (this.flux.store('config').debug)
      console.count("Initializing markets");

    var _client = this.flux.store('config').getEthereumClient();

    // Get last market ID
    _client.getLastMarketID( function(lastMarketID) {
      // Get last opened market ID
      var lastOpenedMarketID = 1;
      try {
        lastOpenedMarketID = web3.toDecimal(_client.getHex('EtherEx', 'market'));
      }
      catch(e) {
        _client.putHex('EtherEx', 'market', web3.fromDecimal(lastOpenedMarketID));
      }

      // Get favorites
      var favorites = [];
      try {
        var favs = JSON.parse(_client.getString('EtherEx', 'favorites'));
        if (favs)
          favorites = favs;
      }
      catch (e) {
        _client.putString('EtherEx', 'favorites', '[]');
      }

      this.dispatch(constants.market.UPDATE_MARKETS, {
        lastMarketID: lastMarketID,
        lastOpenedMarketID: lastOpenedMarketID,
        favorites: favorites
      });

      this.dispatch(constants.market.LOAD_MARKETS);

      // Load markets
      for (var id = 1; id <= lastMarketID; id++)
        this.flux.actions.market.loadMarket(id, true);

    }.bind(this), function(error) {
      this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
    }.bind(this));
  };

  this.loadMarket = function(id, init) {
    if (init && this.flux.store('config').debug)
      console.count("loadMarket triggered");

    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var state = this.flux.store("MarketStore").getState();

    _client.loadMarket(id, user, state.favorites, function(market) {
      this.dispatch(constants.market.LOAD_MARKET, market);

      // TODO this shouldn't be needed...
      this.flux.actions.market.loadMarketBalances(market);

      // Watch prices
      _client.watchPrices(market, this.flux.actions.market.updatePrices, function(error) {
        this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
      }.bind(this));

      // Watch transactions / trades
      _client.watchTransactions(user, market, this.flux.actions.market.updateTransactions, function(error) {
        this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
      }.bind(this));

      if (init)
        this.flux.actions.market.updateProgress(init);
      else
        this.dispatch(constants.market.UPDATE_MARKET, market);

    }.bind(this), function(error) {
      this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
    }.bind(this));
  };

  this.updateMarket = function() {
    if (this.flux.store('config').debug)
      console.count("updateMarket triggered");

    var id = this.flux.store("MarketStore").getState().market.id;
    this.flux.actions.market.loadMarket(id, false);
  };

  this.marketsLoaded = function(init) {
    if (init && this.flux.store('config').debug)
      utils.log("Markets", "loaded");

    this.dispatch(constants.market.LOAD_MARKETS_SUCCESS);

    this.flux.actions.user.updateBalanceSub();

    var market = this.flux.store("MarketStore").getState().market;

    // Load trades
    if (init)
      this.flux.actions.trade.loadTradeIDs(market, true);
    else
      this.flux.actions.trade.updateTrades();

    // Load BtcSwap tickets
    this.flux.actions.ticket.loadTicketIDs(true);
  };

  this.loadMarketBalances = function(market) {
    var _client = this.flux.store('config').getEthereumClient();
    var user = this.flux.store("UserStore").getState().user;

    _client.updateBalanceSub(market, user.id, function(_market, available, trading, balance) {
        this.flux.actions.market.updateMarketBalances(_market, available, trading, balance);
    }.bind(this), function(error) {
        this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
    }.bind(this));
  };

  this.updateMarketBalances = function(market, available, trading, balance) {
    this.dispatch(constants.market.UPDATE_MARKET_BALANCE, {
      market: market,
      balance: {
        available: available,
        trading: trading,
        balance: balance
      }
    });
  };

  this.updateProgress = function(init) {
    var state = this.flux.store("MarketStore").getState();
    var current = state.progress + 1;
    var percent = parseFloat(((current / state.lastMarketID) * 100).toFixed(2));

    this.dispatch(constants.market.LOAD_MARKETS_PROGRESS, current);

    this.flux.actions.config.updatePercentLoaded(percent);

    if (percent >= 100)
      this.flux.actions.market.marketsLoaded(init);
  };

  this.updateLastPrice = function(marketId, price) {
    var market = this.flux.store("MarketStore").getState().market;
    if (marketId == market.id) {
      this.dispatch(constants.market.UPDATE_LAST_PRICE, {
        price: price
      });
    }
  };

  this.switchMarket = function(market) {
    var _client = this.flux.store('config').getEthereumClient();

    this.dispatch(constants.market.CHANGE_MARKET, market);

    // Save last market ID
    _client.putHex('EtherEx', 'market', web3.fromDecimal(market.id));

    // Update sub balance
    this.flux.actions.user.updateBalanceSub(market);

    // Reload and watch price changes
    this.flux.actions.market.reloadPrices();

    // Reload and watch transactions
    this.flux.actions.market.reloadTransactions();

    // Switch market's trades
    this.flux.actions.trade.switchMarket(market);
  };

  this.registerMarket = function(market) {
    var _client = this.flux.store('config').getEthereumClient();

    // console.log("REGISTER_MARKET", market);
    _client.registerMarket(market, function(id) {
      this.dispatch(constants.market.REGISTER_MARKET, id);
    }.bind(this), function(error) {
      this.dispatch(constants.market.REGISTER_MARKET_FAIL, {error: error});
    }.bind(this));
  };

  this.reloadPrices = function() {
    var _client = this.flux.store('config').getEthereumClient();

    this.dispatch(constants.market.RELOAD_PRICES);

    var market = this.flux.store("MarketStore").getState().market;
    _client.watchPrices(market, this.flux.actions.market.updatePrices, function(error) {
      this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
    }.bind(this));

    this.dispatch(constants.market.UPDATE_PRICES_DATA);
  };

  this.updatePrices = function(price) {
    this.dispatch(constants.market.UPDATE_PRICES, price);
    this.dispatch(constants.market.UPDATE_PRICES_DATA);
  };

  this.reloadTransactions = function() {
    var _client = this.flux.store('config').getEthereumClient();

    this.dispatch(constants.market.RELOAD_TRANSACTIONS);

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;
    _client.watchTransactions(user, market, this.flux.actions.market.updateTransactions, function(error) {
      this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
    }.bind(this));
  };

  this.updateTransactions = function(tx) {
    this.dispatch(constants.market.UPDATE_TRANSACTIONS, tx);
  };

  this.toggleFavorite = function(favorite) {
    var _client = this.flux.store('config').getEthereumClient();

    var favorites = this.flux.store('MarketStore').getState().favorites;

    // Store favorites in client DB
    if (favorite.favorite === true)
      favorites.push(favorite.id);
    else if (favorite.favorite === false)
      _.pull(favorites, favorite.id);

    _client.putString('EtherEx', 'favorites', JSON.stringify(favorites));

    this.dispatch(constants.market.TOGGLE_FAVORITE, {
      id: favorite.id,
      favorite: favorite.favorite,
      favorites: favorites
    });
  };
};

module.exports = MarketActions;
