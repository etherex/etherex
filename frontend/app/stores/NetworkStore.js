var _ = require('lodash');
var Fluxxor = require('fluxxor');
var constants = require('../js/constants');

var NetworkStore = Fluxxor.createStore({

  initialize: function () {
    this.ready = null;
    this.client = null;
    this.peerCount = null;
    this.blockNumber = 0;
    this.blockTime = null;
    this.blockTimestamp = null;
    this.networkLag = null;
    this.ether = null;
    this.gasPrice = null;
    this.ethereumStatus = null;
    this.mining = null;
    this.hashrate = null;
    this.blockChainAge = null;
    this.isMonitoringBlocks = false;

    this.bindActions(
      constants.network.UPDATE_NETWORK, this.handleUpdateNetwork,
      constants.network.UPDATE_READY, this.handleUpdateReady,
      constants.network.UPDATE_ETHEREUM_STATUS, this.handleUpdateEthereumStatus,
      constants.network.UPDATE_IS_MONITORING_BLOCKS, this.handleUpdateIsMonitoringBlocks,
      constants.network.UPDATE_BLOCK_CHAIN_AGE, this.handleUpdateBlockChainAge
    );
  },

  getState: function () {
    return {
      ready: this.ready,
      client: this.client,
      peerCount: this.peerCount,
      blockNumber: this.blockNumber,
      blockTime: this.blockTime,
      blockTimestamp: this.blockTimestamp,
      networkLag: this.networkLag,
      ether: this.ether,
      gasPrice: this.gasPrice,
      ethereumStatus: this.ethereumStatus,
      mining: this.mining,
      hashrate: this.hashrate,
      blockChainAge: this.blockChainAge,
      isMonitoringBlocks: this.isMonitoringBlocks
    };
  },

  handleUpdateReady: function (payload) {
    this.ready = payload.ready;
    // this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateNetwork: function (payload) {
    _.merge(this, payload);
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateBlockChainAge: function (payload) {
    this.blockChainAge = payload.blockChainAge;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateEthereumStatus: function (payload) {
    this.ethereumStatus = payload.ethereumStatus;
    this.emit(constants.CHANGE_EVENT);
  },

  handleUpdateIsMonitoringBlocks: function (payload) {
    this.isMonitoringBlocks = payload.isMonitoringBlocks;
    this.emit(constants.CHANGE_EVENT);
  }
});

module.exports = NetworkStore;
