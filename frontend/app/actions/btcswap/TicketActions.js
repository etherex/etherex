var _ = require("lodash");
var https = require('https');
var bigRat = require('big-rational');

var constants = require("../../js/constants");
var fixtures = require("../../js/fixtures");
var utils = require("../../js/utils");

var TicketActions = function() {

  this.loadTicketIDs = function(init) {
    if (this.flux.stores.config.debug)
      console.count("loadTicketIDs triggered");

    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.getTicketIDs(function(ticketIDs) {
      this.dispatch(constants.ticket.LOAD_TICKET_IDS, ticketIDs);
      if (init)
        this.flux.actions.ticket.loadTickets(ticketIDs);
    }.bind(this), function(error) {
      this.dispatch(constants.ticket.LOAD_TICKET_IDS_FAIL, {error: error});
    }.bind(this));
  };

  this.loadTickets = function(ticketIDs) {
    if (this.flux.stores.config.debug)
      console.count("loadTickets triggered");

    // Put tickets in loading state
    this.dispatch(constants.ticket.LOAD_TICKETS);

    for (var i = ticketIDs.length - 1; i >= 0; i--)
      this.flux.actions.ticket.loadTicket(ticketIDs[i]);
  };

  this.loadTicket = function(id) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    var tickets = this.flux.store("TicketStore").getState();
    if (tickets.error)
      this.flux.actions.ticket.ticketsLoaded();

    btcSwapClient.lookupTicket(id, function(ticket) {
      if (ticket && ticket.id)
        ticket = this.flux.actions.ticket.setTicketFlags(ticket);

      this.dispatch(constants.ticket.LOAD_TICKET, ticket);

      this.flux.actions.ticket.updateProgress();
    }.bind(this), function(error) {
      this.dispatch(constants.ticket.LOAD_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.updateTicket = function(id) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.lookupTicket(id, function(ticket) {
      if (ticket.id)
        this.dispatch(constants.ticket.UPDATE_TICKET, ticket);
    }.bind(this), function(error) {
      this.dispatch(constants.ticket.LOAD_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.updateProgress = function() {
    var tickets = this.flux.store("TicketStore").getState();
    var current = tickets.progress + 1;
    var total = tickets.ticketIDs.length;

    if (!total) {
      this.dispatch(constants.ticket.LOAD_TICKETS_PROGRESS, {
        progress: current,
        percent: current
      });
      return;
    }

    var percent = parseFloat(((current / total) * 100).toFixed(2));

    this.dispatch(constants.ticket.LOAD_TICKETS_PROGRESS, {
      progress: current,
      percent: percent
    });

    if (percent >= 100)
        this.flux.actions.ticket.ticketsLoaded();
  };

  this.ticketsLoaded = function() {
    if (this.flux.stores.config.debug)
      console.count("ticketsLoaded triggered");

    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    // Watch tickets
    btcSwapClient.watchTickets(function(ticketEvent, ticketId) {
      if (ticketEvent == 'new' || ticketEvent == 'reserved')
        this.flux.actions.ticket.updateTicket(ticketId);
      else if (ticketEvent == 'removed')
        this.dispatch(constants.ticket.CANCEL_TICKET_SUCCESS, ticketId);
    }.bind(this), function(error) {
      this.dispatch(constants.ticket.LOAD_TICKET_FAIL, {error: error});
    }.bind(this));

    // Get BTC block height and hash
    this.flux.actions.ticket.getBlockchainHead();
    this.flux.actions.ticket.getLastBlockHeight();

    this.dispatch(constants.ticket.LOAD_TICKETS_SUCCESS);
  };

  this.setTicketFlags = function(ticket) {
    var userState = this.flux.stores.UserStore.getState();

    var formattedAmount = utils.formatEther(ticket.amount);

    var reservable = false;
    if (!ticket.claimer ||
        (ticket.expiry > 1 && ticket.expiry < new Date().getTime() / 1000)) {
      reservable = true;
      ticket.txHash = null;
      ticket.claimer = null;
      ticket.expiry = 1;
    }

    var claimable = false;
    if (!reservable && ticket.claimer == userState.user.id.substr(2))
      claimable = true;

    ticket.formattedAmount = formattedAmount;
    ticket.reservable = reservable;
    ticket.claimable = claimable;

    return ticket;
  };

  this.lookupTicket = function(id) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.lookupTicket(id, function(ticket) {
      if (this.flux.stores.config.debug)
        utils.log('Ticket: ', ticket);

      if (!ticket || !ticket.id) {
        ticket = {
          id: null,
          address: null,
          amount: null,
          formattedAmount: {value: null, unit: null},
          price: null,
          total: null,
          reservable: false,
          expiry: 1
        };
        this.dispatch(constants.ticket.LOOKUP_TICKET, ticket);
      }
      else {
        ticket = this.flux.actions.ticket.setTicketFlags(ticket);

        this.dispatch(constants.ticket.LOOKUP_TICKET, ticket);

        // TODO live / testnet handling
        if (ticket.txHash && ticket.claimable)
          this.flux.actions.ticket.lookupBitcoinTxHash(ticket, false);
      }
    }.bind(this), function(error) {
      this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.lookupBitcoinTxHash = function(ticket, live) {
    var options = {
      hostname: (live ? '' : 't') + 'btc.blockr.io',
      port: 443,
      path: '/api/v1/tx/raw/' + ticket.txHash,
      method: 'GET',
      withCredentials: false
    };

    var error;
    var req = https.request(options, function(res) {
      if (!res || res.statusCode !== 200) {
        error = "Error retrieving BTC transaction.";
        this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
        utils.error(error);
        return;
      }

      res.on('data', function(data) {
        var json = JSON.parse(data);

        if (json.status !== 'success') {
          error = "Error retrieving BTC transaction data.";
          this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
          utils.error(error, json);
          return;
        }

        data = json.data;
        // TODO check scriptpubkeys, etc exist
        if (!data || !data.tx || !data.tx.vout || data.tx.vout.length < 2 || !data.tx.hex || !data.tx.blockhash) {
          error = "Not enough data in BTC transaction, please wait until it gets mined.";
          this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
          utils.error(error);
          return;
        }

        ticket.rawTx = data.tx.hex;
        ticket.btcPayment = data.tx.vout[0].value;
        ticket.paymentAddr = data.tx.vout[0].scriptPubKey.addresses[0];

        var tx1Script = data.tx.vout[1].scriptPubKey.hex;
        var etherAddr;
        if (tx1Script && tx1Script.length === 50 &&
            tx1Script.slice(0, 6) === '76a914' && tx1Script.slice(-4) === '88ac') { // WTF is this
          etherAddr = tx1Script.slice(6, -4);
        }
        else {
          etherAddr = 'INVALID';
          error = 'Invalid Ethereum address:';
          this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error + " " + tx1Script});
          utils.error(error, tx1Script);
        }
        ticket.etherAddr = etherAddr;

        var feePercentage = bigRat("10").pow("8").times(bigRat(data.tx.vout[1].value)).mod(10000);
        ticket.feePercentage = bigRat(feePercentage).divide(100).valueOf(10) + '%';

        ticket.feeAmount = bigRat(feePercentage).times(ticket.amount).divide(10000).toDecimal();
        ticket.formattedFee = utils.formatEther(ticket.feeAmount);

        if (data.tx.blockhash)
          this.flux.actions.ticket.lookupExtendedDetails(ticket, data.tx.blockhash, live);
        else {
          error = "Missing block hash on transaction.";
          this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
          utils.error(error);
        }

      }.bind(this));
    }.bind(this));

    req.end();
    req.on('error', function(e) {
      error = "Request error:";
      this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error + " " + String(e)});
      utils.error(error, e);
    });

    this.dispatch(constants.ticket.LOOKUP_TICKET, ticket);
  };

  // extended details for claiming ticket, such as merkle proof
  this.lookupExtendedDetails = function(ticket, blockHash, live) {
    var options = {
      hostname: (live ? '' : 't') + 'btc.blockr.io',
      port: 443,
      path: '/api/v1/block/raw/' + blockHash,
      method: 'GET',
      withCredentials: false
    };

    var error;
    var req = https.request(options, function(res) {
      if (!res || res.statusCode !== 200) {
        error = "Error retrieving BTC block.";
        this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
        return;
      }

      res.on('data', function(data) {
        var json = JSON.parse(data);

        if (json.status !== 'success') {
          error = "Error retrieving BTC block data.";
          this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
          utils.error(error, json);
          return;
        }

        data = json.data;
        if (!data || !data.tx) {
          error = "Error: not enough data in BTC block.";
          this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error});
          return;
        }

        ticket.blockHash = (data.hash);

        var txIndex = _.indexOf(data.tx, ticket.txHash);

        var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

        var merkleProof = btcSwapClient.merkleProof(data.tx, txIndex);

        ticket.merkleProof = merkleProof;
        ticket.merkleProofStr = JSON.stringify(merkleProof);

      }.bind(this));
    }.bind(this));

    req.end();
    req.on('error', function(e) {
      error = "Request error:";
      this.dispatch(constants.ticket.LOOKUP_TICKET_FAIL, {error: error + " " + String(e)});
      utils.error(error, e);
    });

    this.dispatch(constants.ticket.LOOKUP_TICKET, ticket);
  };

  this.createTicket = function(btcAddress, numEther, btcTotal) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.createTicket(btcAddress, numEther, btcTotal, function(result) {
      if (this.flux.stores.config.debug)
        utils.log('createTicket tx result:', result);

      var ticket = {
        id: '-',
        address: btcAddress,
        amount: bigRat(numEther).times(fixtures.ether),
        price: bigRat(btcTotal).divide(numEther).toDecimal(),
        total: btcTotal,
        expiry: 1,
        pendingHash: result,
        status: 'pending',
        owner: this.flux.stores.UserStore.user.id
      };
      this.dispatch(constants.ticket.CREATE_TICKET, ticket);
    }.bind(this), function(pendingHash, ticket) {
      if (this.flux.stores.config.debug) {
        utils.log('createTicket completed for ticket #', ticket.id);
        utils.log('pendingHash was', pendingHash);
      }

      this.dispatch(constants.ticket.CREATE_TICKET_SUCCESS, {
        pendingHash: pendingHash,
        ticket: ticket
      });
    }.bind(this), function(error) {
      utils.error('Ticket could not be created:', error);
      this.dispatch(constants.ticket.CREATE_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.cancelTicket = function(id) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.cancelTicket(id, function(ticketId, txHash) {
      if (this.flux.stores.config.debug) {
        utils.log('cancelTicket success for ticket #', ticketId);
        utils.log('cancelTicket tx result:', txHash);
      }
      this.dispatch(constants.ticket.CANCEL_TICKET, ticketId);
    }.bind(this), function(cancelledId) {
      if (this.flux.stores.config.debug)
        utils.log('cancelTicket completed for ticket #', cancelledId);

      // Let global watch remove ticket...
      // this.dispatch(constants.ticket.CANCEL_TICKET_SUCCESS, cancelledId);
    }.bind(this), function(error) {
      utils.error('Ticket could not be cancelled:', error);
      this.dispatch(constants.ticket.CANCEL_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.generateWallet = function() {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.generateWallet(function(wallet) {
      this.dispatch(constants.ticket.UPDATE_WALLET, wallet);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.UPDATE_WALLET_FAIL, {error: error});
    }.bind(this));
  };

  this.importWallet = function(key) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.importWallet(key, function(wallet) {
      this.dispatch(constants.ticket.UPDATE_WALLET, wallet);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.UPDATE_WALLET_FAIL, {error: error});
    }.bind(this));
  };

  this.clearWallet = function() {
    this.dispatch(constants.ticket.UPDATE_WALLET, {address: null, key: null, tx: null});
  };

  this.createTransaction = function(recipient, amount, fee) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();
    var wallet = this.flux.stores.TicketStore.wallet;
    var user = this.flux.stores.UserStore.user;

    btcSwapClient.createTransaction(wallet, recipient, amount, fee, user.id.substr(2), function(tx) {
      this.dispatch(constants.ticket.UPDATE_TX, tx);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.UPDATE_TX_FAIL, {error: error});
    }.bind(this));
  };

  this.propagateTransaction = function(txHex) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.propagateTransaction(txHex, function(result) {
      this.dispatch(constants.ticket.PROPAGATE_TX, result);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.UPDATE_TX_FAIL, {error: error});
    }.bind(this));
  };

  this.reserveTicket = function(id, txHash, powNonce) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.reserveTicket(id, txHash, powNonce, function(result) {
      if (this.flux.stores.config.debug)
        utils.log('reserveTicket result: ', result);

      this.dispatch(constants.ticket.RESERVE_TICKET, id);
    }.bind(this), function(reservedTicket) {
      if (this.flux.stores.config.debug)
        utils.log('reserveTicket completed for ticket #', reservedTicket.id);

      // Let global watch update ticket...
      this.dispatch(constants.ticket.RESERVE_TICKET_SUCCESS, reservedTicket);
    }.bind(this), function(error) {
      utils.error('Ticket could not be reserved:', error);
      this.dispatch(constants.ticket.RESERVE_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.claimTicket = function(id, txHex, txHash, txIndex, merkleSibling, txBlockHash) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.claimTicket(id, txHex, txHash, txIndex, merkleSibling, txBlockHash, function(result) {
      if (this.flux.stores.config.debug)
        utils.log('claimTicket result: ', result);

      this.dispatch(constants.ticket.CLAIM_TICKET, id);
    }.bind(this), function(claimedId) {
      if (this.flux.stores.config.debug)
        utils.log('claimedTicket completed for ticket #', claimedId);

      // Let global watch remove ticket...
      this.dispatch(constants.ticket.CLAIM_TICKET_SUCCESS, claimedId);
    }.bind(this), function(error) {
      utils.error('Ticket could not be claimed:', error);
      this.dispatch(constants.ticket.CLAIM_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.computePoW = function(id, txHash) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.computePoW(id, txHash, function(result) {
      this.dispatch(constants.ticket.UPDATE_POW, result);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.COMPUTE_POW_FAIL, {error: error});
    }.bind(this));
  };

  this.verifyPoW = function(id, txHash, nonce) {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.verifyPoW(id, txHash, nonce, function(result) {
      this.dispatch(constants.ticket.VERIFY_POW, result);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.VERIFY_POW_FAIL, {error: error});
    }.bind(this));
  };

  this.getBlockchainHead = function() {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.getBlockchainHead(function(result) {
      this.dispatch(constants.ticket.UPDATE_BTC_HEAD, {btcHead: result});
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.UPDATE_BTC_HEAD_FAIL, {error: error});
    }.bind(this));
  };

  this.getLastBlockHeight = function() {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();

    btcSwapClient.getLastBlockHeight(function(result) {
      // Check actual latest block height from 'https://btc.blockr.io/api/v1/block/info/last'
      var live = false;  // TODO live / testnet handling
      var options = {
        hostname: (live ? '' : 't') + 'btc.blockr.io',
        port: 443,
        path: '/api/v1/block/info/last',
        method: 'GET',
        withCredentials: false
      };

      var error;
      var req = https.request(options, function(res) {
        if (!res || res.statusCode !== 200) {
          error = "Error retrieving BTC block.";
          this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error});
          return;
        }

        res.on('data', function(data) {
          var json = JSON.parse(data);

          if (json.status !== 'success') {
            error = "Error retrieving BTC block height.";
            this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error});
            utils.error(error, json);
            return;
          }

          var blockData = json.data;
          this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT, {btcRealHeight: blockData.nb});
          this.dispatch(constants.ticket.UPDATE_BTC_HEAD, {btcRealHead: blockData.hash});
        }.bind(this));
      }.bind(this));

      req.end();
      req.on('error', function(e) {
        error = "Request error:";
        this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error + " " + String(e)});
        utils.error(error, e);
      }.bind(this));

      // hackish loop for now... FIXME
      setTimeout(function() {
        this.flux.actions.ticket.getLastBlockHeight();
        this.flux.actions.ticket.getBlockchainHead();
      }.bind(this), 30000);

      this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT, {btcHeight: _.parseInt(result)});
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error});
    }.bind(this));
  };

  this.updateBlockHeader = function() {
    var btcSwapClient = this.flux.stores.config.getBtcSwapClient();
    var ticketState = this.flux.stores.TicketStore.getState();
    var blocksBehind = ticketState.btcBehind;

    if (!blocksBehind) {
      this.dispatch(constants.ticket.UPDATE_BTC_HEADER, false);
      return;
    }

    var live = false;  // TODO live / testnet handling
    var nextHeight = ticketState.btcHeight + 1;
    this.dispatch(constants.ticket.UPDATE_BTC_HEADER, nextHeight);

    var options = {
      hostname: (live ? '' : 't') + 'btc.blockr.io',
      port: 443,
      path: '/api/v1/block/info/' + nextHeight,
      method: 'GET',
      withCredentials: false
    };

    var error;
    var req = https.request(options, function(res) {
      if (!res || res.statusCode !== 200) {
        error = "Error retrieving BTC block.";
        this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error});
        return;
      }

      res.on('data', function(data) {
        var json = JSON.parse(data);

        if (json.status !== 'success') {
          error = "Error retrieving BTC block hash.";
          this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error});
          utils.error(error, json);
          return;
        }

        var blockData = json.data;

        if (this.flux.stores.config.debug)
          utils.log("BTC_BLOCK_HASH", blockData.hash);

        btcSwapClient.storeBlockHeader(blockData.hash, function(result) {
          if (result === blockData.nb) {
            this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT, {btcHeight: result});
            this.dispatch(constants.ticket.UPDATE_BTC_HEAD, {btcRealHead: blockData.hash});

            // Loop to next block
            setTimeout(function() {
              if (this.flux.stores.TicketStore.getState().btcHeight <= result)
                this.flux.actions.ticket.updateBlockHeader();
            }.bind(this), 1000);
          }
          else {
            error = `Block height mismatch, expected ${blockData.nb}, saw ${result}`;
            utils.error(error);
            this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error});
          }
        }.bind(this), function(err) {
          error = "Error storing block header:";
          utils.error(error, err);
          this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error + " " + String(err)});
        }.bind(this));

      }.bind(this));
    }.bind(this));

    req.end();
    req.on('error', function(e) {
      error = "Request error:";
      this.dispatch(constants.ticket.UPDATE_BTC_HEIGHT_FAIL, {error: error + " " + String(e)});
      utils.error(error, e);
    }.bind(this));
  };

  this.closeAlert = function() {
    this.dispatch(constants.ticket.CLOSE_ALERT);
  };
};

module.exports = TicketActions;
