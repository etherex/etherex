var React = require("react");

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
// var Alert = require('react-bootstrap/lib/Alert');
var Nav = require("./Nav");

var CreateTicket = React.createClass({

  getInitialState() {
    return {
      isValid: false
    };
  },

  handleSubmit(e) {
    e.preventDefault();

    // TODO confirm modal...
    var address = this.refs.address.getValue();
    var amount = this.refs.amount.getValue();
    var btc = this.refs.btc.getValue();

    this.props.flux.actions.ticket.createTicket(address, amount, btc);
  },

  handleChange(e) {
    e.preventDefault();

    var amount = this.refs.amount.getValue().trim();
    var btc = this.refs.btc.getValue().trim();

    this.setState({
      amount: amount,
      btc: btc,
      price: (parseFloat(btc) / parseFloat(amount)).toFixed(8)
    });
  },

  render() {
    return (
      <div>
        <Nav />
        <div className="col-md-6 col-md-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                Offer your ether for bitcoin
              </h3>
            </div>
            <div className="panel-body">
              <form role="form" onSubmit={this.handleSubmit}>
                <Input type="text" ref="address" label="Bitcoin address" className="form-control"
                  minLength="26" maxLength="35" pattern="[13m][a-km-zA-HJ-NP-Z1-9]{25,34}"
                  data-bind="value: btcAddr"
                  help="Address where you want to receive bitcoins" />

                <Input type="number" ref="amount" label="Ether amount" className="form-control"
                  min="0.000000000000000001" step="0.000000000000000001"
                  value={this.state.amount}
                  onChange={this.handleChange}
                  help="How many ETH you are offering for BTC" />

                <Input type="number" ref="btc" label="Bitcoin amount" className="form-control"
                  min="0.00000001" step="0.00000001"
                  value={this.state.btc}
                  onChange={this.handleChange}
                  help="Total amount of BTC you are offering for your ETH" />

                <Input type="number" ref="price" label="Unit Price" className="form-control" readOnly
                  value={this.state.price}
                  help="Effectively how many BTC you are asking for each ETH" />
                <Button type="submit">Submit offer</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CreateTicket;
