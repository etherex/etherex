var Fluxxor = require('fluxxor');
var fixtures = require("../js/fixtures");
var constants = require('../js/constants');

var ConfigStore = Fluxxor.createStore({
  initialize: function () {
    this.host = process.env.RPC_HOST || fixtures.host;
    this.address = fixtures.addresses.etherex;
    this.debug = false;
    this.percentLoaded = null;
    this.ethereumClient = null;
    this.demoMode = false;
    this.range = 75; // max 300 blocks / ~ 1 hour
    this.rangeEnd = 0;
    this.timeout = 120;

    this.bindActions(
      constants.config.UPDATE_ADDRESS, this.handleUpdateAddress,
      constants.config.UPDATE_DEBUG, this.handleUpdateDebug,
      constants.config.UPDATE_DEMO_MODE, this.handleDemoMode,
      constants.config.UPDATE_ETHEREUM_CLIENT_SUCCESS, this.handleUpdateEthereumClientSuccess,
      constants.config.UPDATE_ETHEREUM_CLIENT_FAILED, this.handleUpdateEthereumClientFailed,
      constants.config.UPDATE_PERCENT_LOADED_SUCCESS, this.handleUpdatePercentLoadedSuccess,
      constants.config.UPDATE_RANGE, this.onUpdateRange,
      constants.config.UPDATE_RANGE_END, this.onUpdateRangeEnd
    );
  },

  getState: function () {
    return {
      host: this.host,
      address: this.address,
      debug: this.debug,
      percentLoaded: this.percentLoaded,
      ethereumClient: this.ethereumClient,
      demoMode: this.demoMode,
      range: this.range,
      rangeEnd: this.rangeEnd,
      timeout: this.timeout
    };
  },

  getEthereumClient: function () {
    return this.ethereumClient;
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

  handleUpdateAddress: function (payload) {
    this.address = payload.address;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateDebug: function (payload) {
    this.debug = payload.debug;
    this.emit(constants.CHANGE_EVENT);
  },

  handleDemoMode: function (payload) {
    this.demoMode = payload.enable;
    // this.emit(constants.CHANGE_EVENT);
  },

  onUpdateRange: function(payload) {
    this.range = payload.range;
    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateRangeEnd: function(payload) {
    this.rangeEnd = payload.rangeEnd;
    this.emit(constants.CHANGE_EVENT);
  }
});

module.exports = ConfigStore;
