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
    var demoMode = this.flux.stores.config.demoMode;
    if (demoMode) {
      this.flux.actions.network.stopMonitoring();
      return;
    }

    var ethereumClient = this.flux.stores.config.getEthereumClient();
    var networkState = this.flux.stores.network.getState();

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
      this.flux.actions.network.updateBlockchainAge( function() {
        // Reload client
        this.flux.actions.config.updateEthereumClient();

        // Watch new blocks / reset filter
        ethereumClient.watchNewBlock(this.flux.actions.network.onNewBlock);
      }.bind(this));
    }

    if (nowUp) {
      this.flux.actions.network.updateBlockchain();

      var timeOut = this.flux.stores.config.getState().timeout;

      if (networkState.blockChainAge > timeOut) {

        // Put trades in loading state if network is no longer ready
        if (networkState.ready || networkState.ready === null) {
          this.dispatch(constants.trade.LOAD_TRADES);
          this.dispatch(constants.network.UPDATE_READY, {
            ready: false
          });
        }

        var blocksRemaining = networkState.blockChainAge / constants.SECONDS_PER_BLOCK;
        var totalBlocks = networkState.blockNumber + blocksRemaining;
        this.dispatch(constants.config.UPDATE_PERCENT_LOADED_SUCCESS, {
          percentLoaded: (totalBlocks - blocksRemaining) * 100 / totalBlocks
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
  this.updateBlockchain = function () {
    var ethereumClient = this.flux.stores.config.getEthereumClient();

    ethereumClient.getBlock('latest', function(block) {
      if (block.timestamp) {
        var lastState = this.flux.stores.network.getState();
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
        }

        this.flux.actions.network.updateNetwork();
      }
    }.bind(this));
  };

  this.updateBlockchainAge = function(success) {
    var ethereumClient = this.flux.stores.config.getEthereumClient();

    ethereumClient.getBlock('latest', function(block) {
      if (block.timestamp) {
        var blockChainAge = (new Date().getTime() / 1000) - block.timestamp;
        this.dispatch(constants.network.UPDATE_BLOCK_CHAIN_AGE, {
          blockChainAge: blockChainAge
        });
      }
      success(block);
    }.bind(this));
  };

  this.updateClientInfo = function() {
    var ethereumClient = this.flux.stores.config.getEthereumClient();
    ethereumClient.getClient(function(client) {
      this.dispatch(constants.network.UPDATE_NETWORK, { client: client });
    }.bind(this));
  };

  this.updateNetwork = function () {
    var ethereumClient = this.flux.stores.config.getEthereumClient();

    ethereumClient.getPeerCount(function(peerCount) {
      this.dispatch(constants.network.UPDATE_NETWORK, { peerCount: peerCount });
    }.bind(this));

    if (this.flux.stores.network.getState().ready) {
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
    if (this.flux.stores.config.debug)
      utils.log("GOT BLOCK", log);

    this.flux.actions.network.updateBlockchain();
  };

  // TODO ???
  // this.setWatchers = function (error, log) {
  //
  // };

  this.startMonitoring = function () {
    var networkState = this.flux.stores.network.getState();

    if (!networkState.isMonitoring) {
      this.dispatch(constants.network.UPDATE_IS_MONITORING_BLOCKS, {
        isMonitoring: true
      });

      // Start network checking loop
      this.flux.actions.network.checkNetwork();
    }
  };

  this.stopMonitoring = function () {
    var networkState = this.flux.stores.network.getState();

    if (networkState.isMonitoring) {
      this.dispatch(constants.network.UPDATE_IS_MONITORING_BLOCKS, {
        isMonitoring: false
      });
    }
  };

  this.reset = function() {
    var ethereumClient = this.flux.stores.config.getEthereumClient();
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    ethereumClient.reset();
    if (btcSwapClient)
      btcSwapClient.reset();

    // Restart monitoring
    this.flux.actions.network.startMonitoring();
  };

  this.initializeNetwork = function() {
    this.flux.actions.network.updateClientInfo();
    this.flux.actions.network.updateNetwork();
  };
};

module.exports = NetworkActions;
