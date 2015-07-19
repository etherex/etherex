var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;
var FormattedRelative = ReactIntl.FormattedRelative;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var ConfirmModal = require('../ConfirmModal');
var AlertDismissable = require('../AlertDismissable');

var Nav = require("./Nav");

var ClaimTicket = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    var ticket = this.props.ticket.ticket ? this.props.ticket.ticket : null;
    return {
      lookingUp: false,
      ticketId: ticket ? ticket.id : null,
      ticket: {
        id: null,
        amount: null,
        formattedAmount: {value: null, unit: null},
        total: null,
        price: null,
        address: null,
        feePercentage: null,
        btcPayment: null,
        paymentAddr: null,
        etherAddr: null,
        txHash: null,
        nonce: null,
        feeAmount: null,
        formattedFee: {value: null, unit: null},
        expiry: null,
        claimer: null,
        merkleProof: null,
        merkleProofStr: null,
        claimable: false,
        reservable: false
      },
      txHash: null,
      nonce: null,
      isValid: false,
      showModal: false,
      alertLevel: 'info',
      alertMessage: ''
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
  },

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function(show) {
    this.refs.alerts.setState({alertVisible: show});
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  validateReserve: function(showAlerts) {
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
        confirmMessage: <FormattedMessage
                          message={this.getIntlMessage('btc.reserve')}
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

  handleChangeReserve: function(e) {
    e.preventDefault();
    this.validateReserve(false);
  },

  handleReserveValidation(e) {
    e.preventDefault();
    if (this.validateReserve(true))
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

    // var id = _.parseInt(this.refs.ticketId.getValue());
    // var txHash = this.refs.txhash.getValue().trim();
    var nonce = _.parseInt(this.state.nonce);

    if (!this.validateReserve(true))
      return false;

    // this.setState({
    //     ticketId: null,
    //     txHash: null,
    //     nonce: null
    // });

    this.props.flux.actions.ticket.reserveTicket(this.state.ticketId, this.state.txHash, nonce);
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
  },

  render() {
    return (
      <div>
        <Nav />

        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

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

          <div className="col-md-5">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Ticket
                </h3>
              </div>
              <div className="panel-body">
                <p>Amount: <b>{ this.state.ticket.formattedAmount.value } {this.state.ticket.formattedAmount.unit}</b></p>
                <p>Price: <b>{ this.state.ticket.price ? this.state.ticket.price + " BTC/ETH" : ""} </b></p>
                <p>Total BTC: <b>{ this.state.ticket.total }</b></p>
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
                <p>Ether Fee to Claimer: <b>{ this.state.ticket.feePercentage }</b></p>
                <p>BTC: <b>{ this.state.ticket.btcPayment }</b></p>
                <p>Bitcoin Address: <b>{ this.state.ticket.paymentAddr }</b></p>
                <p>Ether address: <b>{ this.state.ticket.etherAddr }</b></p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">
              Reserve
            </h3>
          </div>
          <div className="panel-body">
            <form role="form" className="form-horizontal" onSubmit={this.handleReserveValidation}>

              <Input type="text" ref="txhash" label="Bitcoin Transaction Hash"
                labelClassName="col-md-2" wrapperClassName="col-md-7"
                maxLength={64} pattern="[a-fA-F0-9]{64}"
                disabled={!this.state.ticket.reservable}
                value={this.state.ticket.txHash ? this.state.ticket.txHash : this.state.txHash}
                onChange={this.handleChangeReserve} />

              <Input type="text" ref="nonce" label="Proof of Work"
                labelClassName="col-md-2" wrapperClassName="col-md-2"
                disabled={!this.state.ticket.reservable}
                value={this.state.ticket.nonce ? this.state.ticket.nonce : this.state.nonce}
                onChange={this.handleChangeReserve} />

              <Input wrapperClassName="col-sm-10 col-sm-offset-2">
                <Button className={ (this.state.ticket.reservable && this.state.isValid) ? "btn-primary" : ""} type="submit"
                  disabled={(!this.state.ticket.reservable || !this.state.isValid)}>
                  Reserve
                </Button>
              </Input>
            </form>
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
              <h5>Address: <b>{ this.state.ticket.claimer }</b></h5>
              <h5>Expiry: <b>{ this.state.ticket.expiry > 1 &&
                  <span>
                    <FormattedDate value={this.state.ticket.expiry * 1000} format="long" />{' '}
                    (<FormattedRelative value={this.state.ticket.expiry * 1000} />)
                  </span>}
                  </b></h5>
              {
                // To save space, we will toggle #txHash to readonly when a ticket is reserved
                // <h5>Bitcoin Transaction Hash: <strong data-bind="text: claimTxHash"></strong></h5>
              }
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
                disabled={!this.state.ticket.claimable}
                onClick={this.handleClaim}>
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
          onSubmit={this.handleReserve}
        />
      </div>
    );
  }
});

module.exports = ClaimTicket;
