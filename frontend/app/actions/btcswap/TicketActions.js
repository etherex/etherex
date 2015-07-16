// var _ = require("lodash");
// var bigRat = require("big-rational");
var btcswap = require("btc-swap"); // TODO

var constants = require("../../js/constants");
var utils = require("../../js/utils");

var TicketActions = function() {

  this.loadTicketIDs = function(market, init) {
    if (this.flux.store('config').debug)
      console.count("loadTradeIDs triggered");

    // var _client = this.flux.store('config').getEthereumClient();

    btcswap.loadTicketIDs(market, function(ticketIDs) {
      this.dispatch(constants.ticket.LOAD_TICKET_IDS, ticketIDs);
      if (init)
        this.flux.actions.ticket.loadTickets(ticketIDs);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TICKET_IDS_FAIL, {error: error});
    }.bind(this));
  };

  this.loadTicket = function(id) {
    var configState = this.flux.store('config').getState();
    var btcSwap = new btcswap({address: configState.btcSwapAddress});

    // TODO not sure about this...
    var tickets = this.flux.store("TradeStore").getState();
    if (tickets.error)
      this.flux.actions.ticket.ticketsLoaded();

    btcSwap.loadTicket(id, this.flux.actions.ticket.updateProgress, function(ticket) {
      this.dispatch(constants.ticket.LOAD_TICKET, ticket);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.lookupTicket = function(ticketId) {
    var configState = this.flux.store('config').getState();
    var userState = this.flux.store('UserStore').getState();

    var btcSwap = new btcswap({
      address: configState.btcSwapAddress,
      host: configState.host,
      from: userState.user.id,
      debug: true
    });

    btcSwap.lookupTicket(ticketId, function(ticket) {
      utils.log('Ticket: ', ticket);
      this.dispatch(constants.ticket.LOOKUP_TICKET, ticket);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOOKUP_TICKET_FAIL, {error: error});
    }.bind(this));

    // var ticketInfo = btcswap.lookupTicket(ticketId);

    // if (!ticketInfo) {
    //   // swal('Ticket does not exist...', 'or may have been claimed', 'error');
    //   return;
    // }

    // var unixExpiry = ticketInfo.numClaimExpiry;
    // viewm.claimExpiry(unixExpiry);

    // if (!isTicketAvailable(unixExpiry)) {
    //   viewm.claimerAddr(ticketInfo.claimerAddr);
    //   viewm.claimTxHash(ticketInfo.claimTxHash);
    // }

    // viewm.numEther(ticketInfo.numEther);
    // viewm.btcPrice(ticketInfo.btcPrice);
    // viewm.btcAddr(ticketInfo.btcAddr);
  };

  this.cancelTicket = function(ticket) {
    console.log(ticket);
  };

  this.reserveTicket = function(id, txHash, powNonce) {
    var configState = this.flux.store('config').getState();
    var userState = this.flux.store('UserStore').getState();

    var btcSwap = new btcswap({
      address: configState.btcSwapAddress,
      host: configState.host,
      from: userState.user.id,
      debug: true
    });

    btcSwap.reserveTicket(id, "0x" + txHash, powNonce, function(result) {
      utils.log('reserveTicket result: ', result);
      this.dispatch(constants.ticket.RESERVE_TICKET, id);
      // swal(result, '', 'success');
      // update UI
      // viewm.claimerAddr(web3.eth.defaultAccount.substr(2));
      // viewm.claimTxHash(txHash.substr(2));
      // viewm.claimExpiry(moment().add(4, 'hours').unix());
      // doLookup(viewm);
    }.bind(this), function(error) {
      utils.error('Ticket could not be reserved', error);
      this.dispatch(constants.RESERVE_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.computePoW = function(id, txHash) {
    var configState = this.flux.store('config').getState();
    var userState = this.flux.store('UserStore').getState();

    var btcSwap = new btcswap({
      address: configState.btcSwapAddress,
      host: configState.host,
      from: userState.user.id,
      debug: true
    });

    btcSwap.computePoW(id, txHash, function(result) {
      utils.log('POW', result);
      this.dispatch(constants.ticket.UPDATE_POW, result);
    }.bind(this), function(error) {
      utils.error(error);
      this.dispatch(constants.ticket.RESERVE_TICKET_FAIL, {error: error});
    }.bind(this));
  };

  this.claimTicket = function(ticket) {
    console.log(ticket);
  };
};

module.exports = TicketActions;
