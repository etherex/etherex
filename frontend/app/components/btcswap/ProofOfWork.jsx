var React = require("react");

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
// var Alert = require('react-bootstrap/lib/Alert');
// var Nav = require("./Nav");
var utils = require('../../js/utils');

// dd5a8f13c97c8b8d47329fa7bd487df24b7d3b7e855a65eb7fd51e8f94f7e482
// ticket 2 nonce = 2460830
// ticket 3 nonce = 726771

var ProofOfWork = React.createClass({

  getInitialState() {
    return {
      isValid: false
    };
  },

  handleCompute() {
    // TODO
    var id = this.refs.ticketId.getValue();
    var txHash = this.refs.txhash.getValue();
    // var nonce = this.refs.nonce.getValue();
    utils.log("ticketId", id);
    utils.log("txHash", txHash);
    // utils.log("nonce", nonce);

    this.props.flux.actions.ticket.computePoW(id, txHash);
  },

  handleVerify(e) {
    e.preventDefault();
    // TODO
  },

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            Proof of Work
          </h3>
        </div>
        <div className="panel-body">
          <form className="form-horizontal" role="form">
            <Input type="number" ref="ticketId" label="Ticket ID"
              min="1" step="1"
              labelClassName="col-md-2" wrapperClassName="col-md-10" />
            <Input type="text" ref="txhash" label="Bitcoin Transaction Hash"
              labelClassName="col-md-2" wrapperClassName="col-md-10"
              help="Hash of the bitcoin transaction that will be used to reserve the ticket." />
            <Input type="text" ref="nonce" label="Computed nonce"
              labelClassName="col-md-2" wrapperClassName="col-md-10"
              value={this.props.flux.store("TicketStore").pow}
              disabled={true}
              help="A valid nonce is required to reserve a ticket with a given transaction hash." />

            <Input wrapperClassName="col-sm-10 col-sm-offset-2">
              <Button onClick={this.handleCompute} style={{marginRight: 10}}>Compute</Button>
              <Button onClick={this.handleVerify} disabled={!this.state.isValid}>Verify</Button>
            </Input>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = ProofOfWork;
