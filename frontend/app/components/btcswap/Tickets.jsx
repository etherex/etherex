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
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var ConfirmModal = require('../ConfirmModal');
// var utils = require('../js/utils');

var Tickets = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin, StoreWatchMixin("TicketStore")],

  getInitialState() {
    return {
      showModal: false,
      showConfirmModal: false,
      message: null,
      submit: null
    };
  },

  getStateFromFlux() {
    return {
      tickets: this.props.flux.store('TicketStore').tickets
    };
  },

  openConfirmModal: function(ticket) {
    this.setState({
      showConfirmModal: true,
      message: ticket.owner == this.props.user.user.id ?
        "Are you sure you want to cancel this ticket?" :
        <div>
          { (!ticket.claimer || (ticket.expiry > 1 && ticket.expiry < new Date().getTime() / 1000)) ?
              "Reserve ticket #" + ticket.id + "?" : "Claim ticket #" + ticket.id + "?" }
          <TicketDetails ticket={ticket} />
        </div>,
      submit: function() { this.handleAction(ticket); }.bind(this)
    });
  },

  closeConfirmModal: function() {
    this.setState({ showConfirmModal: false });
  },

  openModal: function(ticket) {
    this.setState({
      showModal: true,
      message: <TicketDetails ticket={ticket} />
    });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  handleAction(ticket) {
      if (ticket.owner == this.props.user.user.id)
        this.props.flux.actions.ticket.cancelTicket(ticket.id);
      else if (!ticket.claimer) {
        this.props.flux.actions.ticket.lookupTicket(ticket.id);
        this.context.router.transitionTo('claim');
      }
      else {
        this.props.flux.actions.ticket.lookupTicket(ticket.id);
        this.context.router.transitionTo('claim');
      }
  },

  render() {
    var ticketRows = this.state.tickets.map(function (ticket, i) {
      return (
        <TicketRow
          flux={this.props.flux} key={ticket.id} count={i} ticket={ticket}
          isOwn={ticket.owner === this.props.user.user.id} user={this.props.user.user}
          openModal={this.openModal} openConfirmModal={this.openConfirmModal}
          review={this.props.review} />
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
              <th className="text-right">AMOUNT</th>
              <th className="text-right">PRICE BTC/ETH</th>
              <th className="text-right">TOTAL</th>
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
          show={this.state.showConfirmModal}
          onHide={this.closeConfirmModal}
          message={this.state.message}
          onSubmit={this.state.submit}
        />

        <Modal show={this.state.showModal} onHide={this.closeModal} animation={true} enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title>Ticket details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <big><p>{this.state.message}</p></big>
          </Modal.Body>
          <Modal.Footer>
              <Button onClick={this.closeModal} bsStyle="primary">Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = Tickets;
