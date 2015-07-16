// var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var Fluxxor = require("fluxxor");
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
// var FormattedMessage = ReactIntl.FormattedMessage;
var TransitionGroup = require('../TransitionGroup');

var Table = require("react-bootstrap/lib/Table");

var Nav = require("./Nav");
var TicketRow = require("./TicketRow");
var TicketDetails = require("./TicketDetails");
var ConfirmModal = require('../ConfirmModal');
// var utils = require('../js/utils');

var Tickets = React.createClass({
  mixins: [IntlMixin, StoreWatchMixin("TicketStore")],

  getInitialState() {
    return {
      showModal: false,
      message: null,
      submit: null
    };
  },

  getStateFromFlux() {
    return {
      tickets: this.props.flux.store('TicketStore').tickets
    };
  },

  openModal: function(ticket, action) {
    // console.log(ticket, this.props);
    this.setState({
      showModal: true,
      message: !action ? <TicketDetails ticket={ticket} /> :
        ticket.owner == this.props.user.user.id ?
          "Are you sure you want to cancel this ticket?" :
          <div>
            { ticket.reservable ? "Reserve?" : "Claim?" }
            <TicketDetails ticket={ticket} />
          </div>,
      submit: function() { this.handleAction(ticket); }.bind(this)
    });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  handleAction(ticket) {
      if (ticket.owner == this.props.user.user.id)
        this.props.flux.actions.ticket.cancelTicket({
          ticket: ticket
        });
      else if (ticket.reservable)
        this.props.flux.actions.ticket.reserveTicket({
          ticket: ticket
        });
      else
        this.props.flux.actions.ticket.claimTicket({
          ticket: ticket
        });
  },

  render() {
    var ticketRows = this.state.tickets.map(function (ticket, i) {
      return (
        <TicketRow
          flux={this.props.flux} key={ticket.id} count={i} ticket={ticket}
          isOwn={ticket.owner === this.props.user.user.id} user={this.props.user.user}
          openModal={this.openModal} review={this.props.review} />
      );
    }.bind(this));

    return (
      <div>
        <Nav />
        {
        // <h3>Tickets offering Ether for Bitcoin</h3>
        }
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-right">ID</th>
              <th className="text-right">ETHER</th>
              <th className="text-right">PRICE PER BTC</th>
              <th className="text-right">TOTAL BTC</th>
              <th className="text-center">BTC ADDRESS</th>
              <th className="text-center">EXPIRY</th>
              <th className="text-center trade-op"></th>
            </tr>
          </thead>
          <TransitionGroup transitionName="trades" component="tbody" enterTimeout={1000} leaveTimeout={1000}>
            {ticketRows}
          </TransitionGroup>
        </Table>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          user={this.props.user.user}
          message={this.state.message}
          onSubmit={this.state.submit}
        />
      </div>
    );
  }
});

module.exports = Tickets;
