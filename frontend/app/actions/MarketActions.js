var _ = require("lodash");
var utils = require("../js/utils");
var constants = require("../js/constants");
var web3 = require("web3");

var MarketActions = function() {

  this.initializeMarkets = function() {
    if (this.flux.store('config').getState().debug)
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
    if (init && this.flux.store('config').getState().debug)
      console.count("loadMarket triggered");

    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var state = this.flux.store("MarketStore").getState();

    _client.loadMarket(id, user, init, init ? this.flux.actions.market.updateProgress : false, state.favorites, function(market) {
      this.dispatch(constants.market.LOAD_MARKET, market);
      if (!init)
        this.dispatch(constants.market.UPDATE_MARKET, market);
    }.bind(this), function(error) {
      this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
    }.bind(this));
  };

  this.marketsLoaded = function(init) {
      if (init && this.flux.store('config').getState().debug)
        utils.log("Markets", "loaded");

      var _client = this.flux.store('config').getEthereumClient();

      this.dispatch(constants.market.LOAD_MARKETS_SUCCESS);

      // Load user sub balances
      this.flux.actions.user.updateBalanceSub();

      // Update user's market balances
      this.flux.actions.market.updateMarketsBalances();

      var marketsState = this.flux.store("MarketStore").getState();

      // Load trades
      if (init)
        this.flux.actions.trade.loadTradeIDs(marketsState.market, true);
      else
        this.flux.actions.trade.updateTrades();

      // Watch price changes
      var market = this.flux.store("MarketStore").getState().market;
      _client.watchPrices(market, this.flux.actions.market.updatePrices, function(error) {
        this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
      }.bind(this));

      // Watch transactions
      var user = this.flux.store("UserStore").getState().user;
      _client.watchTransactions(user, market, this.flux.actions.market.updateTransactions);
  };

  this.loadMarketBalances = function(market) {
      var _client = this.flux.store('config').getEthereumClient();
      var user = this.flux.store("UserStore").getState().user;

      _client.updateBalanceSub(market, user.id, function(market, available, trading, balance) {
          this.flux.actions.market.updateMarketBalances(market, available, trading, balance);
      }.bind(this), function(error) {
          this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
      }.bind(this));
  };

  this.updateMarketsBalances = function() {
    if (this.flux.store('config').getState().debug)
      console.count("updateMarketsBalances triggered");

    // Load per market balances
    var markets = this.flux.store("MarketStore").getState().markets;
    for (var i = 0; i < markets.length; i++)
      this.flux.actions.market.loadMarketBalances(markets[i]);
  };

  this.updateMarketBalances = function(market, available, trading, balance) {
    // console.log(market.name, available, trading, balance);
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

  this.updateMarket = function() {
    if (this.flux.store('config').getState().debug)
      console.count("updateMarket triggered");

    var id = this.flux.store("MarketStore").getState().market.id;
    this.flux.actions.market.loadMarket(id, false);
  };

  this.switchMarket = function(market) {
    var _client = this.flux.store('config').getEthereumClient();

    this.dispatch(constants.market.CHANGE_MARKET, market);

    // Save last market ID
    _client.putHex('EtherEx', 'market', web3.fromDecimal(market.id));

    // Update sub balance
    this.flux.actions.user.updateBalanceSub();

    // Switch market's trades
    this.flux.actions.trade.switchMarket(market);

    // Reload and watch price changes
    this.flux.actions.market.reloadPrices();

    // Reload and watch transactions
    this.flux.actions.market.reloadTransactions();
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

  this.updateLastPrice = function(market_id, price) {
    var market = this.flux.store("MarketStore").getState().market;
    if (market_id == market.id) {
      this.dispatch(constants.market.UPDATE_LAST_PRICE, {
        price: price
      });
    }
  };

  this.reloadPrices = function() {
    var _client = this.flux.store('config').getEthereumClient();

    this.dispatch(constants.market.RELOAD_PRICES);

    var market = this.flux.store("MarketStore").getState().market;
    _client.watchPrices(market, this.flux.actions.market.updatePrices);

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
    _client.watchTransactions(user, market, this.flux.actions.market.updateTransactions);
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
