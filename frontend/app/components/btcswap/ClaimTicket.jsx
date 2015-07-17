var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;
var FormattedRelative = ReactIntl.FormattedRelative;
// var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
// var Alert = require('react-bootstrap/lib/Alert');

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
        price: null,
        address: null,
        feePercentage: null,
        btcPayment: null,
        paymentAddr: null,
        etherAddr: null,
        txHash: null,
        feeAmount: null,
        formattedFee: {value: null, unit: null},
        expiry: null,
        claimer: null,
        merkleProof: null,
        merkleProofStr: null,
        claimable: false,
        reservable: false
      }
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

    var id = _.parseInt(this.refs.ticketId.getValue());
    var txHash = this.refs.txhash.getValue().trim();
    var powNonce = _.parseInt(this.refs.pownonce.getValue());

    this.props.flux.actions.ticket.reserveTicket(id, txHash, powNonce);
  },

  handleClaim(e) {
    e.preventDefault();

    // var id = _.parseInt(this.refs.ticketId.getValue());
    // var txHash = this.refs.txhash.getValue().trim();
    var ticket = this.state.ticket;
    var merkleProof = ticket.merkleProof;
    this.props.flux.actions.ticket.claimTicket(
      ticket.id,
      ticket.rawTx,
      ticket.txHash,
      merkleProof.txIndex,
      merkleProof.sibling,
      ticket.blockHash
    );
  },

  handleChange: function(e) {
    e.preventDefault();
    var ticketId = this.refs.ticketId.getValue();
    this.setState({
      ticketId: ticketId,
      lookingUp: false
    });
  },

  render() {
    return (
      <div>
        <Nav />
        {
        // <h3>Reserve then Claim Ether</h3>
        }
        <div className="row">
          <div className="col-md-2">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Ticker ID lookup
                </h3>
              </div>
              <div className="panel-body">
                <form className="form" onSubmit={this.handleLookup}>
                  <div className="form-group">
                    <label>Ticket ID</label>
                    <Input type="number" className="form-control" ref="ticketId"
                      min={1} step={1}
                      value={this.state.ticketId}
                      onChange={this.handleChange}/>
                  </div>
                  <Button onClick={this.handleLookup} disabled={this.state.lookingUp}>
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
            <form className="form-horizontal">
              <Input type="text" ref="txhash" label="Bitcoin Transaction Hash"
                labelClassName="col-md-2" wrapperClassName="col-md-7"
                disabled={!this.state.ticket.reservable}
                value={this.state.ticket.txHash} />
              <Input type="text" ref="pownonce" label="Proof of Work"
                labelClassName="col-md-2" wrapperClassName="col-md-2"
                disabled={!this.state.ticket.reservable}
                data-bind="value: powNonce" />
              <Input wrapperClassName="col-sm-10 col-sm-offset-2">
                <Button className={ this.state.ticket.reservable ? "btn-primary" : ""}
                  disabled={!this.state.ticket.reservable}
                  onClick={this.handleReserve}>
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
      </div>
    );
  }
});

module.exports = ClaimTicket;
