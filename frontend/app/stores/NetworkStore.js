var _ = require('lodash');
var Fluxxor = require('fluxxor');
var constants = require('../js/constants');

var NetworkStore = Fluxxor.createStore({

  initialize: function () {
    this.client = null;
    // this.accounts = null;
    // this.primaryAccount = null;
    this.peerCount = null;
    this.blockNumber = null;
    this.blocktime = null;
    this.ether = null;
    this.gasPrice = null;
    this.ethereumStatus = null;
    this.mining = null;
    this.hashrate = null;
    this.blockChainAge = null;
    this.isMonitoringBlocks = false;
    this.hasCheckedQuorum = false;

    this.bindActions(
      constants.network.LOAD_NETWORK, this.handleUpdateNetwork,
      constants.network.UPDATE_ETHEREUM_STATUS, this.handleUpdateEthereumStatus,
      constants.network.UPDATE_IS_MONITORING_BLOCKS, this.handleUpdateIsMonitoringBlocks,
      constants.network.UPDATE_BLOCK_CHAIN_AGE, this.handleUpdateBlockChainAge
    );
  },

  getState: function () {
    return {
      client: this.client,
      // accounts: this.accounts,
      // primaryAccount: this.primaryAccount,
      peerCount: this.peerCount,
      blockNumber: this.blockNumber,
      blocktime: this.blocktime,
      ether: this.ether,
      gasPrice: this.gasPrice,
      ethereumStatus: this.ethereumStatus,
      mining: this.mining,
      hashrate: this.hashrate,
      blockChainAge: this.blockChainAge,
      isMonitoringBlocks: this.isMonitoringBlocks,
      hasCheckedQuorum: this.hasCheckedQuorum
    };
  },

  // getAccount: function () {
  //   if (_.isNull(this.primaryAccount)) {
  //     return null;
  //   }
  //
  //   var account = this.primaryAccount;
  //   if (_.isUndefined(account)) {
  //     return null;
  //   }
  //
  //   return account;
  // },

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
