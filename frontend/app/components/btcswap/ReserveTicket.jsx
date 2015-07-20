var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var AlertModal = require('../AlertModal');
var ConfirmModal = require('../ConfirmModal');

var Nav = require("./Nav");

var ReserveTicket = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState() {
    return {
      lookingUp: false,
      ticketId: this.props.ticket.ticket ? this.props.ticket.ticket.id : null,
      ticket: this.props.ticket.ticket,
      txHash: null,
      nonce: null,
      isValid: false,
      showModal: false,
      alertLevel: 'info',
      alertMessage: '',
      showAlert: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.ticket.ticket !== this.props.ticket.ticket) {
      var ticket = nextProps.ticket.ticket;

      this.setState({
        ticketId: ticket.id,
        ticket: nextProps.ticket.ticket,
        lookingUp: false
      });
    }

    if (nextProps.ticket.error)
      this.setState({
        showAlert: true,
        alertLevel: 'danger',
        alertMessage: nextProps.ticket.error
      });
  },

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function(show) {
    this.setState({ showAlert: show });
  },

  hideAlert: function() {
    this.props.flux.actions.ticket.closeAlert();
    this.setState({ showAlert: false});
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  validate: function(showAlerts) {
    // var id = _.parseInt(this.refs.ticketId.getValue());
    var txHash = this.refs.txhash.getValue().trim();
    var nonce = this.refs.nonce.getValue();

    this.setState({
      txHash: txHash,
      nonce: nonce
    });

    if (!txHash || !nonce) {
      this.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else {
      this.setState({
        isValid: true,
        confirmMessage: <FormattedMessage message={this.getIntlMessage('btc.reserve')}
                          id={this.state.ticket.id}
                          amount={this.state.ticket.formattedAmount.value}
                          unit={this.state.ticket.formattedAmount.unit}
                          total={this.state.ticket.total}
                          price={this.state.ticket.price}
                          address=<samp>{this.state.ticket.address}</samp> />
      });

      this.showAlert(false);

      return true;
    }

    this.setState({
      isValid: false
    });

    if (showAlerts)
      this.showAlert(true);

    return false;
  },

  handleChangeTicket: function(e) {
    e.preventDefault();
    var ticketId = this.refs.ticketId.getValue();
    this.setState({
      ticketId: ticketId,
      lookingUp: false
    });
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(false);
  },

  handleValidation(e) {
    e.preventDefault();
    if (this.validate(true))
      this.openModal();
  },

  handleLookup(e) {
    e.preventDefault();

    var id = _.parseInt(this.refs.ticketId.getValue());

    if (!this.state.lookingUp)
      this.props.flux.actions.ticket.lookupTicket(id);

    this.setState({
      lookingUp: true
    });
  },

  handleReserve(e) {
    e.preventDefault();

    if (!this.validate(true))
      return false;

    this.props.flux.actions.ticket.reserveTicket(this.state.ticketId, this.state.txHash, _.parseInt(this.state.nonce));

    this.setState({
        ticketId: null,
        txHash: null,
        nonce: null
    });

    this.context.router.transitionTo('btc', {ticket: this.state.ticketId});
  },

  render() {
    return (
      <div>
        <Nav />

        <div className="row">
          <div className="col-md-2">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Ticker ID lookup
                </h3>
              </div>
              <div className="panel-body">
                <form role="form" onSubmit={this.handleLookup}>
                  <Input type="number" className="form-control" ref="ticketId" label="Ticket ID"
                    min={1} step={1}
                    value={this.state.ticketId}
                    onChange={this.handleChangeTicket}/>
                  <Button type="submit" disabled={this.state.lookingUp}>
                    Lookup
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Ticket
                </h3>
              </div>
              <div className="panel-body">
                <p>Amount: <b>{ this.state.ticket.formattedAmount.value } { this.state.ticket.formattedAmount.unit }</b></p>
                <p className="text-overflow">Price: <b>{ this.state.ticket.price ? this.state.ticket.price + " BTC/ETH" : ""} </b></p>
                <p className="text-overflow">Total BTC: <b>{ this.state.ticket.total }</b></p>
                <p className="text-overflow">Bitcoin Address: <b>{ this.state.ticket.address }</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Reserve
                </h3>
              </div>
              <div className="panel-body">
                <form role="form" className="form-horizontal" onSubmit={this.handleValidation}>

                  <Input type="text" ref="txhash" label="BTC Transaction Hash"
                    labelClassName="col-md-3" wrapperClassName="col-md-9"
                    maxLength={64}
                    disabled={!this.state.ticket.reservable}
                    value={this.state.ticket.txHash ? this.state.ticket.txHash : this.state.txHash}
                    onChange={this.handleChange} />

                  <Input type="text" ref="nonce" label="Proof of Work"
                    labelClassName="col-md-3" wrapperClassName="col-md-4"
                    disabled={!this.state.ticket.reservable}
                    value={this.state.ticket.nonce ? this.state.ticket.nonce : this.state.nonce}
                    onChange={this.handleChange} />

                  <Input wrapperClassName="col-sm-10 col-sm-offset-2">
                    <Button className={ (this.state.ticket.reservable && this.state.isValid) ? "btn-primary" : ""} type="submit"
                      disabled={(!this.state.ticket.reservable || !this.state.isValid)}>
                      Reserve
                    </Button>
                  </Input>
                </form>
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={this.state.confirmMessage}
          flux={this.props.flux}
          onSubmit={this.handleReserve}
        />

        <AlertModal
          show={this.state.showAlert}
          onHide={this.hideAlert}
          alertTitle="Oh snap!"
          message={this.state.alertMessage}
          level={this.state.alertLevel}
        />
      </div>
    );
  }
});

module.exports = ReserveTicket;
