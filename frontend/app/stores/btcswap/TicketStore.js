var _ = require("lodash");
var Fluxxor = require("fluxxor");

var constants = require("../../js/constants");

var TicketStore = Fluxxor.createStore({

    initialize: function(options) {
        this.title = "Tickets";
        this.tickets = options.tickets || [
          {
            id: 1,
            reservable: false,
            status: "default",
            owner: "0xd5623514f22d7569a13126e91c2eaff5b8df8479",
            address: "18zX3wb318o2Pw9ZUHgG3mmQME536Qg2Ha",
            amount: 42000000000000000000,
            price: 0.0081337,
            total: 0.3416154,
            expiry: new Date().getTime() + 3600 * 1000
          },
          {
            id: 2,
            reservable: true,
            status: "default",
            owner: "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826",
            address: "18zX3wb318o2Pw9ZUHgG3mmQME536Qg2Ha",
            amount: 1337000000000000000000,
            price: 0.00748739,
            total: 10.01064043,
            expiry: new Date().getTime() + 4200 * 1000
          }
        ];
        this.ticket = {};
        this.loading = true;
        this.updating = false;
        this.error = null;
        this.ticketIDs = [];
        this.pow = null;
        this.percent = 0;
        this.progress = 0;
        this.estimate = 0;
        this.note = '';
        this.message = '';

        this.bindActions(
            constants.ticket.LOOKUP_TICKET, this.onLookupTicket,
            constants.ticket.LOOKUP_TICKET_FAIL, this.onTicketsFail,
            constants.ticket.LOAD_TICKET_IDS, this.onUpdateTicketIDs,
            constants.ticket.LOAD_TICKET_IDS_FAIL, this.onTicketsFail,
            constants.ticket.LOAD_TICKET, this.onLoadTicket,
            constants.ticket.LOAD_TICKETS_PROGRESS, this.onLoadTicketsProgress,
            constants.ticket.LOAD_TICKETS_SUCCESS, this.onLoadTicketsSuccess,
            constants.ticket.LOAD_TICKET_FAIL, this.onTicketsFail,
            constants.ticket.LOAD_DEMO_DATA, this.onLoadDemoData,
            constants.ticket.UPDATE_POW, this.onUpdatePoW,
            constants.ticket.UPDATE_TICKET, this.onUpdateTicket,
            constants.ticket.UPDATE_TICKETS, this.onUpdateTickets,
            constants.ticket.UPDATE_TICKETS_MESSAGE, this.onUpdateMessage,
            constants.ticket.UPDATE_TICKETS_SUCCESS, this.onLoadTicketsSuccess,
            constants.ticket.UPDATE_TICKETS_FAIL, this.onTicketsFail,
            constants.ticket.CREATE_TICKET, this.onCreateTicket,
            constants.ticket.CREATE_TICKET_SUCCESS, this.onCreateTicketSuccess,
            constants.ticket.CREATE_TICKET_FAIL, this.onTicketsFail,
            constants.ticket.RESERVE_TICKET, this.onClaimTicket,
            constants.ticket.RESERVE_TICKET_FAIL, this.onTicketsFail,
            constants.ticket.CLAIM_TICKET, this.onClaimTicket,
            constants.ticket.CLAIM_TICKET_FAIL, this.onTicketsFail,
            constants.ticket.CANCEL_TICKET, this.onCancelTicket,
            constants.ticket.CANCEL_TICKET_FAIL, this.onTicketsFail,
            constants.ticket.ESTIMATE_GAS, this.onEstimate,
            constants.ticket.ESTIMATE_GAS_ACTION, this.onEstimateGas
        );
    },

    onLookupTicket: function(payload) {
      this.ticket = payload;
      this.emit(constants.CHANGE_EVENT);
    },

    onUpdateTicketIDs: function(payload) {
        this.ticketIDs = payload;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTickets: function() {
        this.tickets = [];
        this.loading = true;
        this.error = null;
        this.percent = 0;
        this.progress = 0;

        this.emit(constants.CHANGE_EVENT);
    },

    onLoadDemoData: function(payload) {
        _.merge(this, payload);
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateTickets: function() {
        this.loading = true;
        this.updating = true;
        this.error = null;
        this.percent = 0;
        this.progress = 0;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTicketsProgress: function (payload) {
        this.progress = payload.progress;
        this.percent = payload.percent;
        this.emit(constants.CHANGE_EVENT);
    },

    refreshTickets: function() {
        // Sort and update state
        this.tickets = _.sortBy(this.tickets, 'price').reverse();
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTicket: function(payload) {
        this.tickets.push(payload);
        this.refreshTickets();
    },

    onUpdateTicket: function(payload) {
      var key = -1;

      // Replace current ticket with updated one or delete claimed ones
      // TODO compare changes and animate in components
      if (payload.amount !== 0) {
        key = _.findKey(this.tickets, { 'id': payload.id });
        if (key && key != -1) {
          // console.log("TICKET UPDATED", payload.id);
          if (payload.amount === 0)
            this.tickets.splice(key, 1);
          else
            this.tickets[key] = payload;
        }
        else
          this.tickets.push(payload);
      }
      else {
        //   console.log("TICKET REMOVED", payload.id);
        key = _.findKey(this.tickets, { 'id': payload.id });
        if (key && key != -1)
          this.tickets.splice(key, 1);
      }

      this.refreshTickets();
    },

    onLoadTicketsSuccess: function() {
        this.loading = false;
        this.updating = false;
        this.percent = 100;

        // Remove tickets that are no longer in our ticketIDs
        this.tickets = _.filter(this.tickets, function(ticket) {
          return _.contains(this.ticketIDs, ticket.id);
        }.bind(this));

        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateMessage: function(payload) {
        this.note = payload.note;
        this.message = payload.message;

        this.emit(constants.CHANGE_EVENT);
    },

    onCreateTicket: function (payload) {
        // Add and re-sort
        this.tickets.push(payload);

        this.tickets = _.sortBy(this.tickets, 'price');

        this.emit(constants.CHANGE_EVENT);
    },

    onCreateTicketSuccess: function(payload) {
        var key = -1;

        // Replace current ticket with updated one or delete failed ones
        // TODO compare changes and animate
        key = _.findKey(this.tickets, { 'hash': payload.hash });
        if (key && key != -1) {
            if (payload.amount === 0)
              this.tickets.splice(key, 1);
            else
              this.tickets[key] = payload;
        }
        else
          this.tickets.push(payload);

        this.refreshTickets();
    },

    onClaimTicket: function (payload) {
        var index = _.findIndex(this.tickets, {'id': payload.id});
        this.tickets[index].status = "success";
        this.emit(constants.CHANGE_EVENT);
    },

    onCancelTicket: function (payload) {
        var index = _.findIndex(this.tickets, {'id': payload.id});
        this.tickets[index].status = "new";
        this.emit(constants.CHANGE_EVENT);
    },

    onEstimate: function () {
        this.estimate = "...";
        this.emit(constants.CHANGE_EVENT);
    },

    onEstimateGas: function (payload) {
        this.estimate = payload.estimate;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdatePoW: function(payload) {
        this.pow = payload;
        this.emit(constants.CHANGE_EVENT);
    },

    onTicketsFail: function (payload) {
        this.tickets = [];
        this.loading = false;
        this.percent = 100;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            loading: this.loading,
            updating: this.updating,
            error: this.error,
            title: this.title,
            percent: this.percent,
            progress: this.progress,
            ticketIDs: this.ticketIDs,
            tickets: this.tickets,
            ticket: this.ticket,
            pow: this.pow,
            estimate: this.estimate,
            message: this.message,
            note: this.note
        };
    }
});

module.exports = TicketStore;
