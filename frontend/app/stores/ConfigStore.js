var _ = require('lodash');
var Fluxxor = require('fluxxor');
var fixtures = require("../js/fixtures");
var constants = require('../js/constants');

var ConfigStore = Fluxxor.createStore({
  initialize: function () {
    this.host = process.env.RPC_HOST || fixtures.host;
    this.address = fixtures.addresses.etherex;
    this.ethereumClient = null;
    this.btcSwapAddress = fixtures.addresses.btcswap;
    this.btcSwapClient = null;
    this.debug = false;
    this.debugHandler = null;
    this.demoMode = false;
    this.percentLoaded = null;
    this.range = 75; // max 300 blocks / ~ 1 hour
    this.rangeEnd = 0;
    this.si = false;
    this.timeout = 120;
    this.alertCount = null;

    this.bindActions(
      constants.config.UPDATE_CONFIG, this.handleUpdateConfig,
      constants.config.UPDATE_DEMO_MODE, this.handleDemoMode,
      constants.config.UPDATE_ETHEREUM_CLIENT_SUCCESS, this.handleUpdateEthereumClientSuccess,
      constants.config.UPDATE_ETHEREUM_CLIENT_FAILED, this.handleUpdateEthereumClientFailed,
      constants.config.UPDATE_PERCENT_LOADED_SUCCESS, this.handleUpdatePercentLoadedSuccess,
      constants.config.UPDATE_BTC_SWAP_CLIENT, this.handleUpdateBtcSwapClient
    );
  },

  getState: function () {
    return {
      host: this.host,
      address: this.address,
      ethereumClient: this.ethereumClient,
      btcSwapAddress: this.btcSwapAddress,
      btcSwapClient: this.btcSwapClient,
      debug: this.debug,
      debugHandler: this.debugHandler,
      demoMode: this.demoMode,
      percentLoaded: this.percentLoaded,
      range: this.range,
      rangeEnd: this.rangeEnd,
      si: this.si,
      timeout: this.timeout,
      alertCount: this.alertCount
    };
  },

  getEthereumClient: function () {
    return this.ethereumClient;
  },

  getBtcSwapClient: function () {
    return this.btcSwapClient;
  },

  handleUpdatePercentLoadedSuccess: function (payload) {
    this.percentLoaded = payload.percentLoaded;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateEthereumClientSuccess: function (payload) {
    this.ethereumClient = payload.ethereumClient;
    this.ethereumClientFailed = false;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateEthereumClientFailed: function () {
    this.ethereumClient = null;
    this.ethereumClientFailed = true;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateBtcSwapClient: function(payload) {
    this.btcSwapClient = payload.btcSwapClient;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateConfig: function (payload) {
    _.merge(this, payload);
    this.emit(constants.CHANGE_EVENT);
  },

  handleDemoMode: function (payload) {
    this.demoMode = payload.enable;
    this.emit(constants.CHANGE_EVENT);
  }
});

module.exports = ConfigStore;
