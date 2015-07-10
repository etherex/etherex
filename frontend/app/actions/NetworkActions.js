var constants = require('../js/constants');
var utils = require('../js/utils');

var NetworkActions = function() {
  /**
   * Update the UI and stores depending on the state of the network.
   *
   * If the daemon just became reachable (including startup), load the
   * latest data and ensure that we're monitoring new blocks to update our
   * stores. If our Ethereum daemon just became unreachable, dispatch an event so
   * an error dialog can be displayed.
   */
  this.checkNetwork = function() {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    var networkState = this.flux.store('network').getState();

    var nowUp = ethereumClient.isAvailable();

    // var wasUp = (networkState.ethereumStatus === constants.network.ETHEREUM_STATUS_CONNECTED);
    var wasDown = (!networkState.ethereumStatus || networkState.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED);

    if (!nowUp) {
      // Reset our web3 filters
      this.flux.actions.network.reset();

      // Put trades in loading state
      this.dispatch(constants.trade.LOAD_TRADES);

      this.dispatch( constants.network.UPDATE_ETHEREUM_STATUS, {
        ethereumStatus: constants.network.ETHEREUM_STATUS_FAILED
      });
      this.dispatch(constants.network.UPDATE_READY, {
        ready: false
      });
    }
    else if (wasDown && nowUp) {
      this.dispatch( constants.network.UPDATE_ETHEREUM_STATUS, {
        ethereumStatus: constants.network.ETHEREUM_STATUS_CONNECTED
      });
      this.flux.actions.network.initializeNetwork();
      this.flux.actions.network.updateBlockchain(false); // sync

      // TODO Reload our filters
      this.flux.actions.config.updateEthereumClient();
      // Watch new blocks / reset filter
      // if (!ethereumClient.filters.blocks)
      ethereumClient.watchNewBlock(this.flux.actions.network.onNewBlock);
    }

    if (nowUp) {
      this.flux.actions.network.updateBlockchain(true); // async
      this.flux.actions.network.updatePeerCount();

      var timeOut = this.flux.store('config').getState().timeout;

      if (networkState.blockChainAge > timeOut) {

        // Put trades in loading state if network is no longer ready
        if (networkState.ready || networkState.ready === null) {
          this.dispatch(constants.trade.LOAD_TRADES);
          this.dispatch(constants.network.UPDATE_READY, {
            ready: false
          });
        }

        this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, {
          percentLoaded: (timeOut / networkState.blockChainAge) * 100
        });

        // Load user addresses if they weren't
        if (!this.flux.store("UserStore").getState().user.addresses.length)
          this.flux.actions.user.loadAddresses(false);
      }
      else if (networkState.blockChainAge && networkState.blockChainAge <= timeOut) {
        if (!networkState.ready || wasDown) {
          // Also put trades in loading state if network was not ready
          this.dispatch(constants.trade.LOAD_TRADES);

          this.dispatch(constants.network.UPDATE_READY, {
            ready: true
          });
          this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, { percentLoaded: 0 });
          this.flux.actions.config.initializeData();
        }
      }
    }

    // check yo self
    setTimeout(this.flux.actions.network.checkNetwork, 3000);
  };

  // Sync method to update blockchain age
  // and async to update all blockchain and network infos
  this.updateBlockchain = function (async) {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    if (async) {
      ethereumClient.getBlock('latest', function(block) {
        if (block.timestamp) {
          var lastState = this.flux.store('network').getState();
          var blockChainAge = new Date().getTime() / 1000 - block.timestamp;
          var blockTime = lastState.blockTimestamp ? block.timestamp - lastState.blockTimestamp : 0;

          this.dispatch(constants.network.UPDATE_BLOCK_CHAIN_AGE, {
            blockChainAge: blockChainAge
          });

          // Update blockchain stats
          if (block.number > lastState.blockNumber) {
            this.dispatch(constants.network.UPDATE_NETWORK, {
              blockNumber: block.number,
              blockTimestamp: block.timestamp,
              blockTime: blockTime ? blockTime : null,
              networkLag: blockChainAge > 0 ? blockChainAge.toFixed(2) : null
            });

            // Update network if block.number changed, meaning new blocks
            // were imported without triggering onNewBlock
            this.flux.actions.network.updateNetwork();
          }
        }
      }.bind(this));
    }
    else {
      var block = ethereumClient.getBlock('latest');
      if (block.timestamp) {
        var blockChainAge = (new Date().getTime() / 1000) - block.timestamp;
        this.dispatch(constants.network.UPDATE_BLOCK_CHAIN_AGE, {
          blockChainAge: blockChainAge
        });
      }
    }
  };

  this.updateClientInfo = function() {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    ethereumClient.getClient(function(client) {
      this.dispatch(constants.network.UPDATE_NETWORK, { client: client });
    }.bind(this));
  };

  this.updatePeerCount = function () {
    var ethereumClient = this.flux.store('config').getEthereumClient();

    ethereumClient.getPeerCount(function(peerCount) {
      this.dispatch(constants.network.UPDATE_NETWORK, { peerCount: peerCount });
    }.bind(this));
  };

  this.updateNetwork = function () {
    var ethereumClient = this.flux.store('config').getEthereumClient();

    ethereumClient.getPeerCount(function(peerCount) {
      this.dispatch(constants.network.UPDATE_NETWORK, { peerCount: peerCount });
    }.bind(this));

    if (this.flux.store('network').getState().ready) {
      ethereumClient.getGasPrice(function(gasPrice) {
        this.dispatch(constants.network.UPDATE_NETWORK, { gasPrice: gasPrice });
      }.bind(this));
      ethereumClient.getMining(function(mining) {
        this.dispatch(constants.network.UPDATE_NETWORK, { mining: mining });
      }.bind(this));
      ethereumClient.getHashrate(function(hashrate) {
        this.dispatch(constants.network.UPDATE_NETWORK, { hashrate: hashrate });
      }.bind(this));
    }
  };

  /**
   * Update data that should change over time in the UI.
   */
  this.onNewBlock = function (error, log) {
    if (this.flux.store('config').debug)
      utils.log("GOT BLOCK", log);

    this.flux.actions.network.updateBlockchain(true);

    var user = this.flux.store("UserStore").getState().user;
    if (user.addresses)
      this.flux.actions.user.updateBalance();
    // this.flux.actions.user.updateBalanceSub();
  };

  // TODO ???
  // this.setWatchers = function (error, log) {
  //
  // };

  this.startMonitoring = function () {
    var networkState = this.flux.store('network').getState();

    if (!networkState.isMonitoring) {
      this.dispatch(constants.network.UPDATE_IS_MONITORING_BLOCKS, {
        isMonitoring: true
      });

      // Start network checking loop
      this.flux.actions.network.checkNetwork();
    }
  };

  this.reset = function() {
    var ethereumClient = this.flux.store('config').getEthereumClient();
    ethereumClient.reset();

    // Restart monitoring
    this.flux.actions.network.startMonitoring();
  };

  this.initializeNetwork = function() {
    this.flux.actions.network.updateClientInfo();
    this.flux.actions.network.updateNetwork();
  };
};

module.exports = NetworkActions;
