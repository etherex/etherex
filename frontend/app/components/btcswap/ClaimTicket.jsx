var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;
var FormattedRelative = ReactIntl.FormattedRelative;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var AlertModal = require('../AlertModal');
var ConfirmModal = require('../ConfirmModal');

var Nav = require('./Nav');
var Blocks = require('./Blocks');

var ClaimTicket = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState() {
    var ticket = this.props.ticket.ticket ? this.props.ticket.ticket : null;
    return {
      lookingUp: false,
      ticketId: ticket ? ticket.id : null,
      ticket: this.props.ticket.ticket,
      txHash: null,
      nonce: null,
      isValid: false,
      showModal: false,
      alertLevel: 'info',
      alertMessage: null,
      alertNote: null,
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
        alertMessage: nextProps.ticket.error,
        alertNote: null
      });

    if (nextProps.ticket.message)
      this.setState({
        showAlert: true,
        alertLevel: 'info',
        alertMessage: nextProps.ticket.message,
        alertNote: nextProps.ticket.note
      });
  },

  setAlert: function(alertLevel, alertMessage, alertNote) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage,
      alertNote: alertNote
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

  handleChange: function(e) {
    e.preventDefault();
    var ticketId = this.refs.ticketId.getValue();
    this.setState({
      ticketId: ticketId,
      lookingUp: false
    });
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

  confirmClaim: function() {
    this.setState({
      showModal: true,
      confirmMessage: <FormattedMessage message={this.getIntlMessage('btc.claim')}
                        id={this.state.ticket.id}
                        amount={this.state.ticket.formattedAmount.value}
                        unit={this.state.ticket.formattedAmount.unit}
                        total={this.state.ticket.total}
                        price={this.state.ticket.price}
                        address=<samp>{this.state.ticket.address}</samp> />
    });
  },

  handleClaim(e) {
    e.preventDefault();

    // var id = _.parseInt(this.refs.ticketId.getValue());
    // var txHash = this.refs.txhash.getValue().trim();
    var ticket = this.state.ticket;
    var merkleProof = ticket.merkleProof;

    // TODO validate...

    this.props.flux.actions.ticket.claimTicket(
      ticket.id,
      ticket.rawTx,
      ticket.txHash,
      merkleProof.txIndex,
      merkleProof.sibling,
      ticket.blockHash
    );

    // this.setState({
    //   ticketId: null
    // });

    // setTimeout(function() {
    //   this.context.router.transitionTo('ticket', {ticketId: ticket.id});
    // }.bind(this), 300);
  },

  render() {
    return (
      <div>
        <Nav />
        <Blocks flux={this.props.flux} ticket={this.props.ticket} />

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
                    onChange={this.handleChange}/>
                  <Button type="submit" disabled={this.state.lookingUp}>
                    Lookup
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Ticket
                </h3>
              </div>
              <div className="panel-body">
                <p>Amount: <b>{ this.state.ticket.formattedAmount.value } { this.state.ticket.formattedAmount.unit }</b></p>
                <p className="text-overflow">Price: <b>{ this.state.ticket.price ? this.state.ticket.price + " BTC/ETH" : ""} </b></p>
                <p className="text-overflow">Total BTC: <b>{ this.state.ticket.total ? this.state.ticket.total + " BTC" : "" }</b></p>
                <p className="text-overflow">Total with fee: <b>{ this.state.ticket.totalWithFee ? this.state.ticket.totalWithFee + " BTC" : "" }</b></p>
                <p className="text-overflow">Bitcoin Address: <b>{ this.state.ticket.address }</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Bitcoin Transaction
                </h3>
              </div>
              <div className="panel-body">
                <p className="text-overflow">Ether fee to claimer: <b>{ this.state.ticket.feePercentage }</b></p>
                <p className="text-overflow">Transaction amount: <b>{ this.state.ticket.btcPayment ? this.state.ticket.btcPayment + " BTC" : "" }</b></p>
                <p className="text-overflow">Bitcoin address: <b>{ this.state.ticket.paymentAddr }</b></p>
                <p className="text-overflow">Ether recipient: <b>{ this.state.ticket.etherAddr }</b></p>
                <p className="text-overflow">Transaction hash: <b>{ this.state.ticket.txHash }</b></p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">
              Claimer
            </h3>
          </div>
          <div className="panel-body">
            <div className="col-md-4">
              <h5>Recipient: <b>{ this.state.ticket.claimer ? '0x' + this.state.ticket.claimer : '' }</b></h5>
              <h5>Expiry: <b>{ this.state.ticket.expiry > 1 &&
                  <span>
                    <FormattedDate value={this.state.ticket.expiry * 1000} format="long" />{' '}
                    (<FormattedRelative value={this.state.ticket.expiry * 1000} />)
                  </span> }
                </b>
              </h5>
              <h5>Claimer will receive ether: { this.state.ticket.formattedFee &&
                <b>{ this.state.ticket.formattedFee.value } { this.state.ticket.formattedFee.unit }</b> }
              </h5>
            </div>

            <div className="col-md-8">
              <h5>Merkle Proof</h5>
              <p>
                <pre>{ this.state.ticket.merkleProofStr }</pre>
              </p>
              <Button className={ this.state.ticket.claimable ? "btn-primary" : ""}
                disabled={!this.state.ticket.claimable || !this.state.ticket.merkleProofStr}
                onClick={this.confirmClaim}>
                Claim
              </Button>
            </div>
          </div>
        </div>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={this.state.confirmMessage}
          flux={this.props.flux}
          onSubmit={this.handleClaim}
        />

        <AlertModal
          show={this.state.showAlert}
          onHide={this.hideAlert}
          alertTitle="Oh snap!"
          message={this.state.alertMessage}
          note={this.state.alertNote}
          level={this.state.alertLevel}
        />
      </div>
    );
  }
});

module.exports = ClaimTicket;
