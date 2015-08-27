var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var AlertModal = require('../AlertModal');
var ConfirmModal = require('../ConfirmModal');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var Nav = require('./Nav');
var Blocks = require('./Blocks');

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
      canGenerateWallet: false,
      canCreateTx: false,
      canPropagateTx: false,
      canSetTxHash: false,
      canComputePoW: false,
      canReserve: false,
      keyLabel: 'Reveal',
      keyVisible: false,
      isValid: false,
      onConfirm: this.handleReserve,
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

    if (!this.state.ticket.reservable || this.state.lookingUp) {
      this.setState({
        canGenerateWallet: false,
        canCreateTx: false,
        canPropagateTx: false,
        canSetTxHash: false,
        canComputePoW: false,
        canReserve: false
      });
    }
    else {
      if (!nextProps.ticket.wallet.address)
        this.setState({
          canGenerateWallet: true
        });
      else
        this.setState({
          canGenerateWallet: false
        });

      if (nextProps.ticket.wallet.address && !nextProps.ticket.wallet.tx)
        this.setState({
          canCreateTx: true
        });
      else
        this.setState({
          canCreateTx: false
        });

      if (!this.state.ticket.txHash)
        this.setState({
          canSetTxHash: true
        });
      else
        this.setState({
          canSetTxHash: false
        });

      if ((this.state.ticket.txHash || this.state.txHash) && !this.state.ticket.nonce)
        this.setState({
          canComputePoW: true
        });
      else
        this.setState({
          canComputePoW: false
        });

      if (!this.state.canComputePoW && this.state.ticket.nonce && this.state.ticket.reservable)
        this.setState({
          canReserve: true
        });
      else
        this.setState({
          canReserve: false
        });
    }

    if (!this.state.ticket.reservable && !this.state.lookingUp) {
      if (nextProps.ticket.wallet.address && nextProps.ticket.wallet.tx) {
        this.setState({
          canPropagateTx: true
        });
      }
      else
        this.setState({
          canPropagateTx: false
        });
    }
  },

  keyButton: function() {
    return (
      <Button disabled={!this.props.ticket.wallet.key} onClick={ this.toggleKeyReveal }>
        { this.state.keyLabel }
      </Button>
    );
  },

  toggleKeyReveal: function() {
    this.setState({
      keyVisible: !this.state.keyVisible,
      keyLabel: !this.state.keyVisible ? "Hide" : "Reveal"
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

  clearTx: function() {
    var ticket = this.state.ticket;
    ticket.txHash = null;
    ticket.nonce = null;
    this.setState({
      ticket: ticket
    });
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
        onConfirm: this.handleReserve,
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

    this.clearTx();
    this.setState({
      lookingUp: true,
      txHash: null
    });
  },

  handleGenerateWallet: function(e) {
    e.preventDefault();

    // TODO validation
    if (!this.props.ticket.wallet.address) {
      this.clearTx();
      this.props.flux.actions.ticket.generateWallet();
    }
    else
      this.setState({
        showAlert: true,
        alertLevel: 'danger',
        alertMessage: "BTC wallet already generated.",
        alertNote: null
      });
  },

  handleImportWallet: function(e) {
    e.preventDefault();

    var key = this.refs.key.getValue();

    // TODO validate key?
    this.props.flux.actions.ticket.importWallet(key);
  },

  handleCreateTransaction: function(e) {
    e.preventDefault();

    this.clearTx();

    // TODO validate fee
    var fee = this.refs.fee.getValue();
    this.props.flux.actions.ticket.createTransaction(this.state.ticket.address, this.state.ticket.total, fee);
  },

  confirmPropagation: function(e) {
    e.preventDefault();

    this.setState({
      showModal: true,
      confirmMessage: "Are you sure you want to broadcast the BTC transaction?",
      onConfirm: this.handlePropagateTransaction
    });
  },

  handlePropagateTransaction: function(e) {
    e.preventDefault();

    if (this.props.ticket.wallet.tx)
      this.props.flux.actions.ticket.propagateTransaction(this.props.ticket.wallet.tx.hex);
    else
      this.setState({
        showAlert: true,
        alertMessage: "No transaction to broadcast to the Bitcoin network.",
        alertNote: null
      });
  },

  confirmClearWallet: function(e) {
    e.preventDefault();

    this.setState({
      showModal: true,
      confirmMessage: "Are you sure you want clear this intermediate BTC wallet?",
      onConfirm: this.handleClearWallet
    });
  },

  handleClearWallet: function(e) {
    e.preventDefault();

    if (this.props.ticket.wallet.address) {
      this.clearTx();
      this.props.flux.actions.ticket.clearWallet();
    }
    else
      this.setState({
        showAlert: true,
        alertMessage: "No wallet to clear.",
        alertNote: null
      });
  },

  handleCompute(e) {
    e.preventDefault();

    var txHash = this.state.ticket.txHash || this.state.txHash;

    this.props.flux.actions.ticket.computePoW(this.state.ticket.id, txHash);

    this.setState({
      lookingUp: true
    });
  },

  handleVerify(e) {
    e.preventDefault();

    if (!this.validate(true))
      return;

    var txHash = this.state.ticket.txHash || this.state.txHash;

    this.props.flux.actions.ticket.verifyPoW(this.state.ticket.id, txHash, this.state.ticket.nonce);

    this.setState({
      lookingUp: false
    });
  },

  handleReserve(e) {
    e.preventDefault();

    if (!this.validate(true))
      return;

    var txHash = this.state.ticket.txHash || this.state.txHash;

    this.props.flux.actions.ticket.reserveTicket(this.state.ticket.id, txHash, this.state.ticket.nonce);

    this.setState({
      alertLevel: "info",
      alertMessage: "Please wait for the Ethereum transaction to be confirmed, then broadcast the BTC transaction.",
      alertNote: null,
      showAlert: true
    });
    // this.setState({
    //     ticketId: null,
    //     txHash: null,
    //     nonce: null
    // });
    //
    // setTimeout(function() {
    //   this.context.router.transitionTo('ticket', {ticketId: this.state.ticket.id});
    // }.bind(this), 250);
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
                <p className="text-overflow">Price: <b>{ this.state.ticket.price ? this.state.ticket.price + " BTC/ETH" : "" }</b></p>
                <p className="text-overflow">Total BTC: <b>{ this.state.ticket.total ? this.state.ticket.total + " BTC" : "" }</b></p>
                <p className="text-overflow">Total with fee: <b>{ this.state.ticket.totalWithFee ? this.state.ticket.totalWithFee + " BTC" : "" }</b></p>
                <p className="text-overflow">Bitcoin Address: <b>{ this.state.ticket.address }</b></p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Intermediate BTC wallet
                </h3>
              </div>
              <div className="panel-body">
                <form role="form" className="form-horizontal">
                  <OverlayTrigger trigger={['hover', 'focus']} placement='top' overlay={
                    <Popover>
                      Send the total BTC amount to this address. Make sure you also include
                      a 0.3mBTC fee for the outgoing BTC transaction.
                    </Popover>}>
                    <Input type="text" label="Address"
                      labelClassName="col-md-3" wrapperClassName="col-md-9"
                      readOnly
                      value={ this.props.ticket.wallet.address } />
                  </OverlayTrigger>

                  <OverlayTrigger trigger={['hover', 'focus']} placement='top' overlay={
                    <Popover>
                      This is your intermediate BTC wallet key. Make sure you back it up
                      if you do send funds to this wallet.
                    </Popover>}>
                    <Input type={this.state.keyVisible ? "text" : "password"} label="Key"
                      labelClassName="col-md-3" wrapperClassName="col-md-9"
                      buttonAfter={ this.keyButton() }
                      readOnly
                      value={ this.props.ticket.wallet.key } />
                    { /* TODO export feature instead... */}
                  </OverlayTrigger>

                  <Input type="textarea" label="Raw BTC transaction"
                    labelClassName="col-md-3" wrapperClassName="col-md-9"
                    readOnly
                    value={this.props.ticket.wallet.tx ? this.props.ticket.wallet.tx.hex : ''} />

                  <Input type="number" ref="fee" label="Ether fee to claimer"
                    labelClassName="col-md-3" wrapperClassName="col-md-9"
                    disabled={!this.state.canCreateTx}
                    min="0" step="0.01" defaultValue="0"
                    addonAfter="%"
                    help="Optional ether fee to claimer." />

                  <div className="col-md-6">
                    <div className="container-fluid form-group">
                      <Button onClick={this.handleGenerateWallet}
                        className={(this.state.canGenerateWallet && "btn-primary") + " btn-block"}
                        disabled={!this.state.canGenerateWallet} >
                          <div className="text-overflow">Generate wallet</div>
                      </Button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="container-fluid form-group">
                      <Button onClick={this.handleCreateTransaction}
                        className={(this.state.canCreateTx && "btn-primary") + " btn-block pull-right"}
                        disabled={!this.state.canCreateTx} >
                          <div className="text-overflow">Create transaction</div>
                      </Button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="container-fluid form-group">
                      <Button onClick={this.confirmClearWallet}
                        className="btn-block"
                        disabled={this.state.canGenerateWallet}>
                          Clear
                      </Button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="container-fluid form-group">
                      <Button onClick={this.confirmPropagation}
                        className={((this.state.canPropagateTx && !this.state.ticket.reservable) && "btn-primary") + " btn-block pull-right"}
                        disabled={!this.state.canPropagateTx} >
                          <div className="text-overflow">Broadcast transaction</div>
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-12">
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
                    maxLength={64} pattern="[a-fA-F0-9]{64}"
                    disabled={!this.state.canSetTxHash}
                    value={this.state.ticket.txHash || this.state.txHash}
                    onChange={this.handleChange} />

                  <Input type="text" ref="nonce" label="Proof of Work"
                    labelClassName="col-md-3" wrapperClassName="col-md-4"
                    value={this.state.ticket.nonce} readOnly />

                  <Input wrapperClassName="col-sm-9 col-sm-offset-3">
                    <Button onClick={this.handleCompute}
                      className={this.state.canComputePoW ? "btn-primary" : ""}
                      disabled={!this.state.canComputePoW}
                      style={{marginRight: 10}}>
                        Compute
                    </Button>
                    <Button onClick={this.handleVerify}
                      className={(this.state.ticket.nonce && !this.state.canReserve) ? "btn-primary" : ""}
                      disabled={!this.state.ticket.nonce}
                      style={{marginRight: 10}}>
                        Verify
                    </Button>
                    <Button type="submit"
                      className={this.state.canReserve ? "btn-primary" : ""}
                      disabled={!this.state.canReserve}>
                        Reserve
                    </Button>
                  </Input>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Import wallet key
                </h3>
              </div>
              <div className="panel-body">
                <form role="form" className="form-horizontal">
                  <OverlayTrigger trigger={['hover', 'focus']} placement='top' overlay={
                    <Popover>
                      Import a previous intermediate BTC wallet key.
                    </Popover>}>
                    <Input type="password" ref="key" label="Key"
                      labelClassName="col-md-3" wrapperClassName="col-md-9"
                      disabled={!!this.props.ticket.wallet.key}
                      value={ this.state.key } />
                  </OverlayTrigger>

                  <Input wrapperClassName="col-md-9 col-md-offset-3">
                    <Button onClick={this.handleImportWallet} disabled={!!this.props.ticket.wallet.key}>
                        Import wallet
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
          onSubmit={this.state.onConfirm}
        />

        <AlertModal
          show={this.state.showAlert}
          onHide={this.hideAlert}
          modalTitle={this.state.alertLevel != "info" ? "Oh snap!" : "It's alive!"}
          message={this.state.alertMessage}
          note={this.state.alertNote}
          level={this.state.alertLevel}
        />
      </div>
    );
  }
});

module.exports = ReserveTicket;
