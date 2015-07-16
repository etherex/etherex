// var _ = require('lodash');
var React = require("react");

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
// var Alert = require('react-bootstrap/lib/Alert');

var Nav = require("./Nav");

var bigRat = require('big-rational');
var utils = require('../../js/utils');
var fixtures = require('../../js/fixtures');

var ClaimTicket = React.createClass({

  getInitialState() {
    var ticket = this.props.ticket.ticket ? this.props.ticket.ticket : null;
    return {
      lookupComplete: false,
      ticketId: ticket ? ticket.id : null,
      ticket: ticket ? ticket : {
        id: null,
        amount: null,
        price: null,
        address: null,
        encodedFee: null,
        btcPayment: null,
        paymentAddr: null,
        etherAddr: null,
        btcTxHash: null,
        computedFee: null,
        expiry: null,
        claimerAddr: null,
        merkleProof: null,
        claimable: false,
        reservable: false
      }
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.ticket.ticket !== this.props.ticket.ticket) {
      var ticket = nextProps.ticket.ticket;
      if (nextProps.ticket.ticket) {
        var reservable = nextProps.ticket.ticket.claimer ? false : true;
        console.log("RESERVABLE", reservable);
        ticket.reservable = reservable;
      }

      this.setState({
        ticket: ticket
      });
    }
  },

  handleLookup(e) {
    e.preventDefault();

    var id = this.refs.ticketId.getValue();

    this.props.flux.actions.ticket.lookupTicket(id);

    this.setState({
      lookupComplete: true
    });
  },

  handleReserve(e) {
    e.preventDefault();

    // TODO
    var id = this.refs.ticketId.getValue();
    var txHash = this.refs.txhash.getValue();
    var powNonce = this.refs.pownonce.getValue();
    utils.log("RESERVE", id);

    this.props.flux.actions.ticket.reserveTicket(id, txHash, powNonce);
  },

  handleChange: function(e) {
    e.preventDefault();
    var ticketId = this.refs.ticketId.getValue();
    this.setState({
      ticketId: ticketId,
      lookupComplete: false
    });
  },

  render() {
    var total = null;
    if (this.state.ticket.amount)
      total = bigRat(this.state.ticket.amount).divide(fixtures.ether).times(bigRat(this.state.ticket.price)).valueOf();
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
                    <Input type="number" className="form-control" ref="ticketId" value={this.state.ticketId} onChange={this.handleChange}/>
                  </div>
                  <Button onClick={this.handleLookup} disabled={this.state.lookupComplete}>
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
                <p>Ether amount: <b>{ this.state.ticket.amount }</b></p>
                <p>Total Price BTC: <b>{ this.state.ticket.price }</b></p>
                <p>Total BTC: <b>{ total }</b></p>
                <p className="text-overflow">Bitcoin Address: <b>{ this.state.ticket.address }</b></p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Bitcoin Transaction
                </h3>
              </div>
              <div className="panel-body">
                <p>Ether Fee to Claimer: <b>{ this.state.ticket.encodedFee }</b></p>
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
                value={this.state.ticket.btcTxHash} />
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
            <div className="col-md-6">
              <h5>Address: <b>{ this.state.ticket.claimerAddr }</b></h5>
              <h5>Expiry: <b>{ this.state.ticket.expiry }</b></h5>
              {
                // To save space, we will toggle #txHash to readonly when a ticket is reserved
                // <h5>Bitcoin Transaction Hash: <strong data-bind="text: claimTxHash"></strong></h5>
              }
              <h5>Claimer will receive ether: <b>{ this.state.ticket.computedFee }</b></h5>
            </div>

            <div className="col-md-6">
              <h5>Merkle Proof</h5>
              <p>
                <textarea disabled className="form-control" name="textarea" value={ this.state.ticket.merkleProof } rows="5"></textarea>
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
