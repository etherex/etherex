var _ = require("lodash");
// var utils = require("../js/utils");
var constants = require("../js/constants");

var MarketActions = function() {

    this.loadMarkets = function(init) {
        if (init && this.flux.store('config').getState().debug)
          console.count("loadMarkets triggered");

        var _client = this.flux.store('config').getEthereumClient();

        var updateProgress = false;
        if (init) {
          this.dispatch(constants.market.LOAD_MARKETS);
          updateProgress = function(progress) {
            if (init) {
              var percent = parseFloat(((progress.current / progress.total) * 100).toFixed(2));
              this.flux.actions.config.updatePercentLoaded(percent);
            }
          }.bind(this);
        }

        var user = this.flux.store("UserStore").getState().user;

        _client.loadMarkets(user, updateProgress, function(markets) {
            // Get last market
            var last = 0;
            try {
              last = _.parseInt(_client.getString('EtherEx', 'market'));
            }
            catch(e) {
              _client.putString('EtherEx', 'market', '0');
            }

            // Get favorites
            var favs = _client.getString('EtherEx', 'favorites');
            var favorites = JSON.parse(favs);
            if (!favorites || typeof(favorites) != 'object')
                favorites = [];

            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, {
              last: last,
              markets: markets,
              favorites: favorites
            });

            // Load user sub balances
            this.flux.actions.user.updateBalanceSub();

            // Load per market balances
            var user = this.flux.store("UserStore").getState().user;
            for (var i = 0; i < markets.length; i++) {
                _client.updateBalanceSub(markets[i], user.id, function(market, available, trading, balance) {
                    this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
                }.bind(this), function(error) {
                    this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
                }.bind(this));
            }

            // Set market balances watch
            if (init)
              _client.setMarketsWatch(this.flux, markets);

            // Load trades
            if (init)
              this.flux.actions.trade.loadTrades();
            else
              this.flux.actions.trade.updateTrades();

            // Watch price changes
            var market = this.flux.store("MarketStore").getState().market;
            _client.watchPrices(market, this.flux.actions.market.updatePrices);

            // Watch transactions
            _client.watchTransactions(user, market, this.flux.actions.market.updateTransactions);

        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.updateMarkets = function() {
        if (this.flux.store('config').getState().debug)
          console.count("updateMarkets triggered");
        this.flux.actions.market.loadMarkets(false);
    };

    this.switchMarket = function(market) {
        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.market.CHANGE_MARKET, market);

        this.flux.actions.trade.switchMarket(market);
        this.flux.actions.user.updateBalanceSub();

        // Save last market
        _client.putString('EtherEx', 'market', String(market.id - 1));

        // Watch price changes
        _client.watchPrices(market, this.flux.actions.market.updatePrices);

        // Watch transactions
        var user = this.flux.store("UserStore").getState().user;
        _client.watchTransactions(user, market, this.flux.actions.market.updateTransactions);
    };

    this.updateMarketBalance = function(market, available, trading, balance) {
        this.dispatch(constants.market.UPDATE_MARKET_BALANCE, {
            market: market,
            balance: {
                available: available,
                trading: trading,
                balance: balance
            }
        });
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

    this.updatePrices = function(price) {
        this.dispatch(constants.market.UPDATE_PRICES, price);
        this.dispatch(constants.market.UPDATE_PRICES_DATA);
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
