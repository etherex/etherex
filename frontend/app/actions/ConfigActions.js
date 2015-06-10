var constants = require('../js/constants');
var utilities = require('../js/utils');
var EthereumClient = require('../clients/EthereumClient');

var ConfigActions = function(client) {

  this.updateEthereumClient = function () {
    // var configState = this.flux.store('config').getState();

    // var clientParams = {
    //   host: configState.host
    // };
    // var ethereumClient = new EthereumClient(clientParams);

    this.dispatch(constants.config.UPDATE_ETHEREUM_CLIENT_SUCCESS, {
      ethereumClient: _client
    });
  };

  this.updatePercentLoaded = function(percent) {
    this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, {
      percentLoaded: percent
    });
  };

  this.updateDemoMode = function(value) {
    this.dispatch(constants.config.UPDATE_DEMO_MODE, {
      enable: value
    });
  };

  this.initializeState = function() {
    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.network.checkNetwork();
  };

  var _client = client;
};

module.exports = ConfigActions;
