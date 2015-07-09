var _ = require("lodash");
var web3 = require('web3');
var utils = require('../js/utils');
var React = require("react/addons");
var constants = require('../js/constants');
var EthereumClient = require('../clients/EthereumClient');

var ConfigActions = function() {

  this.updateEthereumClient = function () {
    var configState = this.flux.store('config').getState();
    var debug = configState.debug;

    var clientParams = {
      address: configState.address,
      host: configState.host,
      range: configState.range,
      rangeEnd: configState.rangeEnd,
      si: configState.si,
      debug: debug,
      flux: this.flux
    };

    var ethereumClient = new EthereumClient(clientParams);

    // Reload configs from client on first run
    if (!configState.ethereumClient && ethereumClient.isAvailable()) {
      var configs = {
        'range': configState.range,
        'rangeEnd': configState.rangeEnd,
        'si': configState.si,
        'timeout': configState.timeout,
        'debug': debug
      };

      // Load / set default configs in web3.db
      for (var key in configs) {
        var result = null;

        try {
          result = web3.toDecimal(ethereumClient.getHex('EtherEx', key));
          configs[key] = result;
        }
        catch(e) {
          ethereumClient.putHex('EtherEx', key, web3.fromDecimal(configs[key]));
        }
      }

      // Update debug handler
      this.flux.actions.config.updateConfig({
        debug: configs.debug,
        init: true
      });

      // Update SI and timeout configs
      this.dispatch(constants.config.UPDATE_CONFIG, {
        si: configs.si,
        timeout: configs.timeout,
        debug: configs.debug
      });

      // Update ethereumClient with ranges and debug
      if (configs.range || configs.rangeEnd || configs.debug) {
          clientParams = {
            host: configState.host,
            address: configState.address,
            range: configs.range,
            rangeEnd: configs.rangeEnd,
            debug: configs.debug,
            error: this.flux.actions.config.failed,
            flux: this.flux
          };
          ethereumClient = new EthereumClient(clientParams);

          this.dispatch(constants.config.UPDATE_CONFIG, {
            range: configs.range,
            rangeEnd: configs.rangeEnd
          });
      }
    }
    // // Transfer our previous filters to the new instance
    // else if (ethereumClient.isAvailable()) {
    //   // ethereumClient.filters = configState.ethereumClient.filters;
    // }

    this.dispatch(constants.config.UPDATE_ETHEREUM_CLIENT_SUCCESS, {
      ethereumClient: ethereumClient
    });
  };

  this.forceLoad = function() {
    var timeout = _.parseInt(this.flux.store('network').blockChainAge + 300);
    this.dispatch(constants.config.UPDATE_CONFIG, {
      timeout: timeout
    });
  };

  this.updatePercentLoaded = function(percent) {
    this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, {
      percentLoaded: percent
    });
  };

  this.updateConfig = function(payload) {
    this.dispatch(constants.config.UPDATE_CONFIG, payload);

    var _client = this.flux.store('config').getEthereumClient();

    if (payload.timeout)
      _client.putHex('EtherEx', 'timeout', web3.fromDecimal(payload.timeout));

    else if (typeof payload.si !== 'undefined')
      _client.putHex('EtherEx', 'si', payload.si ?
                                        web3.fromDecimal(1) :
                                        web3.fromDecimal(0));

    else if (typeof payload.debug !== 'undefined') {
      if (!payload.init || (payload.init && payload.debug))
        utils.log("DEBUGGING", payload.debug);

      if (payload.debug) {
        var handler = function(type, payload) {
            utils.debug(type, payload);
        };
        this.dispatch(constants.config.UPDATE_CONFIG, {
          debugHandler: handler
        });
        this.flux.on("dispatch", handler);
        React.addons.Perf.start();
      }
      else {
        var prevHandler = this.flux.store('config').getState().handler;
        this.dispatch(constants.config.UPDATE_CONFIG, {
          debugHandler: null
        });
        this.flux.removeListener("dispatch", prevHandler);
      }

      if (!payload.init)
        _client.putHex('EtherEx', 'debug', payload.debug ? web3.fromDecimal(1) : web3.fromDecimal(0));
    }

    if (!payload.init)
      this.flux.actions.config.updateEthereumClient();
  };

  this.updateAddress = function(payload) {
    this.dispatch(constants.config.UPDATE_CONFIG, {
      address: payload.address
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putHex('EtherEx', 'address', payload.address);

    this.flux.actions.config.updateEthereumClient();
    // this.flux.actions.market.updateMarkets();
  };

  this.updateDemoMode = function(enable) {
    this.dispatch(constants.config.UPDATE_DEMO_MODE, {
      enable: enable
    });
  };

  this.updateRange = function(range) {
    this.dispatch(constants.config.UPDATE_CONFIG, {
      range: range
    });
    var _client = this.flux.store('config').getEthereumClient();
    _client.putHex('EtherEx', 'range', web3.fromDecimal(range));

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
    _client.putHex('EtherEx', 'rangeEnd', web3.fromDecimal(rangeEnd));

    this.flux.actions.config.updateEthereumClient();

    // this.flux.actions.market.updateMarkets();
    this.flux.actions.market.reloadPrices();
    this.flux.actions.market.reloadTransactions();
  };

  this.failed = function(error) {
    this.dispatch(constants.market.LOAD_MARKETS_FAIL, {
      error: error
    });
  };

  this.initializeState = function() {
    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.network.startMonitoring();
  };

  /**
   * Load all of the application's data, particularly during initialization.
   */
  this.initializeData = function () {
    // Trigger loading addresses, which loads markets, which loads trades
    this.flux.actions.user.loadAddresses(true);
  };
};

module.exports = ConfigActions;
