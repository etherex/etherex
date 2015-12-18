import React from 'react';
import {Table, Button, Modal} from 'react-bootstrap';

import AlertModal from '../AlertModal';
import ConfirmModal from '../ConfirmModal';
import TransitionGroup from '../TransitionGroup';

import Nav from './Nav';
import Blocks from './Blocks';
import TicketRow from './TicketRow';
import TicketDetails from './TicketDetails';

var Tickets = React.createClass({
  getInitialState() {
    return {
      alertLevel: 'info',
      alertMessage: '',
      showAlert: false,
      showModal: false,
      showConfirmModal: false,
      message: null,
      note: null,
      submit: null
    };
  },

  componentDidMount() {
    // TODO smooth / less hackish scroll to ticketId
    if (this.props.params.ticketId && this.refs["ticket-" + this.props.params.ticketId]) {
      var ticketOffset = this.refs["ticket-" + this.props.params.ticketId].offsetTop;
      window.scroll(0, ticketOffset);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.ticket.error)
      this.setState({
        showAlert: true,
        alertLevel: 'danger',
        alertMessage: nextProps.ticket.error
      });
  },

  openConfirmModal: function(ticket) {
    this.setState({
      showConfirmModal: true,
      message: ticket.owner == this.props.user.user.id ?
        "Are you sure you want to cancel this ticket?" :
        <div>
          { (!ticket.claimer || (ticket.expiry > 1 && ticket.expiry < new Date().getTime() / 1000)) ?
              <p>{`Reserve ticket #${ticket.id}?`}</p> :
              <p>{`Claim ticket #${ticket.id}?`}</p> }
        </div>,
      note: <TicketDetails ticket={ticket} />,
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

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function() {
    this.setState({ showAlert: true });
  },

  hideAlert: function() {
    this.props.flux.actions.ticket.closeAlert();
    this.setState({ showAlert: false});
  },

  handleAction(ticket) {
      if (ticket.owner == this.props.user.user.id)
        this.props.flux.actions.ticket.cancelTicket(ticket.id);
      else if (!ticket.claimer || ticket.reservable) {
        this.props.flux.actions.ticket.lookupTicket(ticket.id);
        this.props.history.pushState(null, '/btc/reserve', null);
      }
      else {
        this.props.flux.actions.ticket.lookupTicket(ticket.id);
        this.props.history.pushState(null, '/btc/claim', null);
      }
  },

  render() {
    var ticketRows = this.props.ticket.tickets.map(function (ticket, i) {
      var key = "ticket-" + (ticket.id == '-' ? ticket.pendingHash : ticket.id);
      return (
        <TicketRow
          flux={this.props.flux} ref={key} key={key} count={i} ticket={ticket}
          isOwn={ticket.owner === this.props.user.user.id} user={this.props.user.user}
          openModal={this.openModal} openConfirmModal={this.openConfirmModal} />
      );
    }.bind(this));

    return (
      <div>
        <Nav />
        <Blocks flux={this.props.flux} ticket={this.props.ticket} />

        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-right">ID</th>
              <th className="text-right">AMOUNT</th>
              <th className="text-right">PRICE BTC/ETH</th>
              <th className="text-right">TOTAL</th>
              <th className="text-center">BTC ADDRESS</th>
              <th className="text-center">BY</th>
              <th className="text-center">EXPIRY</th>
              <th className="text-center trade-op"></th>
            </tr>
          </thead>
          <TransitionGroup transitionName="trades" component="tbody" enterTimeout={1000} leaveTimeout={1000}>
            {ticketRows}
          </TransitionGroup>
        </Table>

        <AlertModal
          show={this.state.showAlert}
          onHide={this.hideAlert}
          alertTitle="Oh snap!"
          message={this.state.alertMessage}
          level={this.state.alertLevel}
        />

        <ConfirmModal
          show={this.state.showConfirmModal}
          onHide={this.closeConfirmModal}
          message={this.state.message}
          note={this.state.note}
          onSubmit={this.state.submit}
        />

        <Modal show={this.state.showModal} onHide={this.closeModal} animation={true} enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title>Ticket details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { this.state.message }
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
