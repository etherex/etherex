var _ = require("lodash");
var constants = require('../js/constants');
var EthereumClient = require('../clients/EthereumClient');

var ConfigActions = function() {

  this.updateEthereumClient = function () {
    var configState = this.flux.store('config').getState();

    var clientParams = {
      address: configState.address,
      host: configState.host,
      range: configState.range,
      rangeEnd: configState.rangeEnd
    };
    var ethereumClient = new EthereumClient(clientParams);

    // Reload range configs from client on first run
    if (!configState.ethereumClient && ethereumClient.isAvailable()) {
      var range = false;
      var rangeEnd = false;

      try {
          range = _.parseInt(ethereumClient.getString('EtherEx', 'range'));
      }
      catch(e) {
          ethereumClient.putString('EtherEx', 'range', String(configState.range));
      }

      try {
          rangeEnd = _.parseInt(ethereumClient.getString('EtherEx', 'rangeEnd'));
      }
      catch(e) {
          ethereumClient.putString('EtherEx', 'rangeEnd', String(configState.rangeEnd));
      }

      if (range || rangeEnd) {
          clientParams = {
            address: configState.address,
            host: configState.host,
            range: range,
            rangeEnd: rangeEnd
          };
          ethereumClient = new EthereumClient(clientParams);

          this.dispatch(constants.config.UPDATE_RANGE, {
            range: range
          });
          this.dispatch(constants.config.UPDATE_RANGE_END, {
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

  this.updateAddress = function(payload) {
    this.dispatch(constants.config.UPDATE_ADDRESS, {
      address: payload.address
    });
    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.market.updateMarkets();
  };

  this.updateDemoMode = function(value) {
    this.dispatch(constants.config.UPDATE_DEMO_MODE, {
      enable: value
    });
  };

  this.updateRange = function(range) {
    this.dispatch(constants.config.UPDATE_RANGE, {
      range: range
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putString('EtherEx', 'range', String(range));

    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.market.updateMarkets();
  };

  this.updateRangeEnd = function(rangeEnd) {
    this.dispatch(constants.config.UPDATE_RANGE_END, {
      rangeEnd: rangeEnd
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putString('EtherEx', 'rangeEnd', String(rangeEnd));

    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.market.updateMarkets();
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
