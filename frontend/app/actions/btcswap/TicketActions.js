var _ = require("lodash");
var https = require('https');
var bigRat = require('big-rational');

var constants = require("../../js/constants");
var fixtures = require("../../js/fixtures");
var utils = require("../../js/utils");

var TicketActions = function() {

  // TODO update loading method
  // this.loadTicketIDs = function(market, init) {
  //   if (this.flux.store('config').debug)
  //     console.count("loadTradeIDs triggered");

  //   // var _client = this.flux.store('config').getEthereumClient();

  //   btcswap.loadTicketIDs(market, function(ticketIDs) {
  //     this.dispatch(constants.ticket.LOAD_TICKET_IDS, ticketIDs);
  //     if (init)
  //       this.flux.actions.ticket.loadTickets(ticketIDs);
  //   }.bind(this), function(error) {
  //     this.dispatch(constants.trade.LOAD_TICKET_IDS_FAIL, {error: error});
  //   }.bind(this));
  // };

  // this.loadTicket = function(id) {
  //   var configState = this.flux.store('config').getState();
  //   var btcSwap = new BtcSwap({address: configState.btcSwapAddress});

  //   var tickets = this.flux.store("TradeStore").getState();
  //   if (tickets.error)
  //     this.flux.actions.ticket.ticketsLoaded();

  //   btcSwap.loadTicket(id, this.flux.actions.ticket.updateProgress, function(ticket) {
  //     this.dispatch(constants.ticket.LOAD_TICKET, ticket);
  //   }.bind(this), function(error) {
  //     this.dispatch(constants.trade.LOAD_TICKET_FAIL, {error: error});
  //   }.bind(this));
  // };

  // TODO replace with methods above
  this.loadTickets = function() {
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.getOpenTickets(0, 100, function(tickets) {
      if (this.flux.store('config').debug)
        utils.log("TICKETS", tickets);

      this.dispatch(constants.ticket.LOAD_TICKETS_LOAD, tickets);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.lookupTicket = function(id) {
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();
    var userState = this.flux.store('UserStore').getState();

    btcSwapClient.lookupTicket(id, function(ticket) {
      if (this.flux.store('config').debug)
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

        this.dispatch(constants.ticket.LOOKUP_TICKET, ticket);

        // TODO live / testnet handling
        if (ticket.txHash && claimable)
          this.flux.actions.ticket.lookupBitcoinTxHash(ticket, false);
      }
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOOKUP_TICKET_FAIL, {error: error});
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
          error = "Not enough data in BTC transaction, please wait until it is mined.";
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
        error = "Error retrieving BTC transaction.";
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

        var btcSwapClient = this.flux.store('config').getBtcSwapClient();

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
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.createTicket(btcAddress, numEther, btcTotal, function(result) {
      if (this.flux.store('config').debug)
        utils.log('createTicket tx result:', result);

      var ticket = {
        id: 0,
        address: btcAddress,
        amount: bigRat(numEther).times(fixtures.ether),
        price: bigRat(btcTotal).divide(numEther).toDecimal(),
        total: btcTotal,
        expiry: 1,
        pendingHash: result,
        status: 'new'
      };
      this.dispatch(constants.ticket.CREATE_TICKET, ticket);
    }.bind(this), function(pendingHash, ticket) {
      if (this.flux.store('config').debug) {
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
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.cancelTicket(id, function(result) {
      if (this.flux.store('config').debug)
        utils.log('cancelTicket result: ', result);

      this.dispatch(constants.ticket.CANCEL_TICKET, id);
    }.bind(this), function(cancelledId) {
      if (this.flux.store('config').debug)
        utils.log('cancelTicket completed for ticket #', cancelledId);

      this.dispatch(constants.ticket.CANCEL_TICKET_SUCCESS, cancelledId);
    }.bind(this), function(error) {
      utils.error('Ticket could not be cancelled:', error);
      this.dispatch(constants.ticket.CANCEL_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.reserveTicket = function(id, txHash, powNonce) {
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.reserveTicket(id, txHash, powNonce, function(result) {
      if (this.flux.store('config').debug)
        utils.log('reserveTicket result: ', result);

      this.dispatch(constants.ticket.RESERVE_TICKET, id);
    }.bind(this), function(reservedTicket) {
      if (this.flux.store('config').debug)
        utils.log('reserveTicket completed for ticket #', reservedTicket.id);

      this.dispatch(constants.ticket.RESERVE_TICKET_SUCCESS, reservedTicket);
    }.bind(this), function(error) {
      utils.error('Ticket could not be reserved:', error);
      this.dispatch(constants.ticket.RESERVE_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.claimTicket = function(id, txHex, txHash, txIndex, merkleSibling, txBlockHash) {
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.claimTicket(id, txHex, txHash, txIndex, merkleSibling, txBlockHash, function(result) {
      if (this.flux.store('config').debug)
        utils.log('claimTicket result: ', result);

      this.dispatch(constants.ticket.CLAIM_TICKET, id);
    }.bind(this), function(claimedId) {
      if (this.flux.store('config').debug)
        utils.log('claimedTicket completed for ticket #', claimedId);

      this.dispatch(constants.ticket.CLAIM_TICKET_SUCCESS, claimedId);
    }.bind(this), function(error) {
      utils.error('Ticket could not be claimed:', error);
      this.dispatch(constants.ticket.CLAIM_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.computePoW = function(id, txHash) {
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.computePoW(id, txHash, function(result) {
      if (this.flux.store('config').debug)
        utils.log('PoW nonce:', result);

      this.dispatch(constants.ticket.UPDATE_POW, result);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.COMPUTE_POW_FAIL, {error: error});
    }.bind(this));
  };

  this.verifyPoW = function(id, txHash, nonce) {
    var btcSwapClient = this.flux.store('config').getBtcSwapClient();

    btcSwapClient.verifyPoW(id, txHash, nonce, function(result) {
      if (this.flux.store('config').debug)
        utils.log('PoW result:', result);

      this.dispatch(constants.ticket.VERIFY_POW, result);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.VERIFY_POW_FAIL, {error: error});
    }.bind(this));
  };

  this.closeAlert = function() {
    this.dispatch(constants.ticket.CLOSE_ALERT);
  };
};

module.exports = TicketActions;
