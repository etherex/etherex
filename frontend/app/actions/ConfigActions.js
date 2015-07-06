var _ = require("lodash");
var utils = require('../js/utils');
var constants = require('../js/constants');
var EthereumClient = require('../clients/EthereumClient');

var ConfigActions = function() {

  this.updateEthereumClient = function () {
    var configState = this.flux.store('config').getState();
    var debug = this.flux.store('config').getState().debug;

    if (debug)
      utils.log("DEBUGGING", debug);

    var clientParams = {
      address: configState.address,
      host: configState.host,
      range: configState.range,
      rangeEnd: configState.rangeEnd,
      debug: debug
    };

    var ethereumClient = new EthereumClient(clientParams);

    // Reload range configs from client on first run
    if (!configState.ethereumClient && ethereumClient.isAvailable()) {
      var range = configState.range;
      var rangeEnd = configState.rangeEnd;
      var timeout = configState.timeout;

      // Load range from web3.db
      try {
          range = _.parseInt(ethereumClient.getString('EtherEx', 'range'));
      }
      catch(e) {
          ethereumClient.putString('EtherEx', 'range', String(range));
      }

      // Load rangeEnd from web3.db
      try {
          rangeEnd = _.parseInt(ethereumClient.getString('EtherEx', 'rangeEnd'));
      }
      catch(e) {
          ethereumClient.putString('EtherEx', 'rangeEnd', String(rangeEnd));
      }

      // Load timeout from web3.db
      try {
          timeout = _.parseInt(ethereumClient.getString('EtherEx', 'timeout'));
      }
      catch(e) {
          ethereumClient.putString('EtherEx', 'timeout', String(timeout));
      }
      this.dispatch(constants.config.UPDATE_CONFIG, {
        timeout: timeout
      });

      if (range || rangeEnd) {
          clientParams = {
            address: configState.address,
            host: configState.host,
            range: range,
            rangeEnd: rangeEnd,
            debug: debug
          };
          ethereumClient = new EthereumClient(clientParams);

          this.dispatch(constants.config.UPDATE_CONFIG, {
            range: range,
            rangeEnd: rangeEnd
          });
      }
    }

    this.dispatch(constants.config.UPDATE_ETHEREUM_CLIENT_SUCCESS, {
      ethereumClient: ethereumClient
    });
  };

  this.updatePercentLoaded = function(percent) {
    this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, {
      percentLoaded: percent
    });
  };

  this.updateConfig = function(payload) {
    this.dispatch(constants.config.UPDATE_CONFIG, payload);
    if (payload.timeout) {
      var _client = this.flux.store('config').getEthereumClient();
      _client.putString('EtherEx', 'timeout', payload.timeout);
    }
    this.flux.actions.config.updateEthereumClient();
  };

  this.updateAddress = function(payload) {
    this.dispatch(constants.config.UPDATE_CONFIG, {
      address: payload.address
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putString('EtherEx', 'address', payload.address);

    this.flux.actions.config.updateEthereumClient();
    // this.flux.actions.market.updateMarkets();
  };

  this.updateDemoMode = function(value) {
    this.dispatch(constants.config.UPDATE_DEMO_MODE, {
      enable: value
    });
  };

  this.updateRange = function(range) {
    this.dispatch(constants.config.UPDATE_CONFIG, {
      range: range
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putString('EtherEx', 'range', String(range));

    this.flux.actions.config.updateEthereumClient();
    // this.flux.actions.market.updateMarkets();
    this.flux.actions.market.reloadPrices();
    this.flux.actions.market.reloadTransactions();
  };

  this.updateRangeEnd = function(rangeEnd) {
    this.dispatch(constants.config.UPDATE_CONFIG, {
      rangeEnd: rangeEnd
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putString('EtherEx', 'rangeEnd', String(rangeEnd));

    this.flux.actions.config.updateEthereumClient();
    // this.flux.actions.market.updateMarkets();
    this.flux.actions.market.reloadPrices();
    this.flux.actions.market.reloadTransactions();
  };

  this.initializeState = function() {
    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.network.checkNetwork();
  };

  /**
   * Load all of the application's data, particularly during initialization.
   */
  this.initializeData = function () {
    // Trigger loading addresses, which load markets, which load trades
    this.flux.actions.user.loadAddresses(true);
  };
};

module.exports = ConfigActions;
