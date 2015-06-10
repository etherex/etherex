var constants = require('../js/constants');
if (typeof web3 === 'undefined')
    var web3 = require('web3');

var NetworkActions = function() {
  /**
   * Update the UI and stores depending on the state of the network.
   *
   * If the daemon just became reachable (including startup), load the
   * latest data and ensure that we're monitoring new blocks to update our
   * stores. If our Ethereum daemon just became unreachable, dispatch an event so
   * an error dialog can be display.
   */
  this.checkNetwork = function() {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    var networkState = this.flux.store('network').getState();

    var nowUp = ethereumClient.isAvailable();

    // var wasUp = (networkState.ethereumStatus === constants.network.ETHEREUM_STATUS_CONNECTED);
    var wasDown = (!networkState.ethereumStatus || networkState.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED);

    if (!nowUp) {
      this.dispatch( constants.network.UPDATE_ETHEREUM_STATUS, {
        ethereumStatus: constants.network.ETHEREUM_STATUS_FAILED
      });
    } else if (wasDown && nowUp) {
      this.dispatch( constants.network.UPDATE_ETHEREUM_STATUS, {
          ethereumStatus: constants.network.ETHEREUM_STATUS_CONNECTED
      });

      this.flux.actions.network.loadEverything();
    }

    // check yo self
    if (!this.flux.store('config').getState().demoMode)
      setTimeout(this.flux.actions.network.checkNetwork, 3000);
  };

  this.loadNetwork = function () {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    var networkStats = ethereumClient.getStats();
    var previousBlock = 0;
    if (web3.eth.blockNumber > 3)
      previousBlock = web3.eth.getBlock(web3.eth.blockNumber - 2).timestamp;
    var currentBlock = web3.eth.getBlock('latest').timestamp;
    var diff = currentBlock - previousBlock;

    var blockChainAge = ethereumClient.blockChainAge();
    this.dispatch(constants.network.UPDATE_BLOCK_CHAIN_AGE, { blockChainAge: blockChainAge });

    this.dispatch(constants.network.LOAD_NETWORK, {
      // accounts: ethereumClient.loadAddresses(),
      // primaryAccount: 0,
      client: networkStats.client,
      peerCount: networkStats.peerCount,
      blockNumber: networkStats.blockNumber,
      gasPrice: networkStats.gasPrice,
      mining: networkStats.mining,
      hashrate: networkStats.hashrate,
      blocktime: diff + " s"
    });
  };

  /**
   * Load all of the application's data, particularly during initialization.
   */
  this.loadEverything = function () {
    this.flux.actions.config.updateEthereumClient();
    this.flux.actions.network.loadNetwork();

    var networkState = this.flux.store('network').getState();
    if (networkState.blockChainAge < 80)
      this.flux.actions.user.loadAddresses();

    // start monitoring for updates
    this.flux.actions.network.startMonitoring();
  };

  /**
   * Update data that should change over time in the UI.
   */
  this.onNewBlock = function () {
    var networkState = this.flux.store('network').getState();
    if (networkState.blockChainAge < 80) {
      this.flux.actions.network.loadNetwork();
      this.flux.actions.user.updateBalance();
      this.flux.actions.user.updateBalanceSub();
      // this.flux.actions.market.updateMarkets();
    }
  };

  this.startMonitoring = function () {
    var networkState = this.flux.store('network').getState();
    if (!networkState.isMonitoringBlocks) {
      var ethereumClient = this.flux.store('config').getEthereumClient();
      ethereumClient.startMonitoring(this.flux.actions.network.onNewBlock);
    }
  };
};

module.exports = NetworkActions;
