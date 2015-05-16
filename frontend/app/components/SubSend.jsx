/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");

var Button = require('react-bootstrap/lib/Button');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var fixtures = require("../js/fixtures");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var SubSend = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      amount: 0,
      recipient: null,
      newSend: false
    };
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <div className="container-fluid row">
          <div className="form-group">
            <label className="sr-only" forHtml="address">Address</label>
            <input type="text" className="form-control" maxLength="40" pattern="[a-fA-F\d]+" placeholder="Address" ref="address" onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <label className="sr-only" forHtml="amount">Amount</label>
            <input type="number" min="0.0001" step="0.00000001" className="form-control" placeholder="10.0000" ref="amount" onChange={this.handleChange} />
          </div>
          <div className="form-group">
            {this.state.newSend ?
              <ModalTrigger modal={
                  <ConfirmModal
                    message={
                      "Are you sure you want to send" +
                        " " + utils.numeral(this.state.amount, 4) + " " + this.props.market.name +
                        " to " + this.state.recipient + " ?"}
                    flux={this.getFlux()}
                    onSubmit={this.onSubmitForm}
                  />
                }>
                <Button className="btn-block btn-primary" type="submit" key="send">Send</Button>
              </ModalTrigger>
            : <Button className="btn-block" type="submit" key="send_fail">Send</Button>}
          </div>
        </div>
      </form>
    );
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    this.validate(e, true);
  },

  validate: function(e, showAlerts) {
    e.preventDefault();

    var address = this.refs.address.getDOMNode().value.trim();
    var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());

    this.setState({
      recipient: address,
      amount: amount
    });

    if (!address || !amount) {
      this.props.setAlert('warning', "Fill it up mate!");
    }
    else if (!amount) {
      this.props.setAlert('warning', "Dont' be cheap...");
    }
    else if (amount > this.props.user.balance_sub_available) {
      this.props.setAlert('warning', "Not enough " + this.props.market.name + " available to send, got " + utils.format(this.props.user.balance_sub_available) + ", needs " + utils.format(amount));
    }
    else if (address.length != 40) {
        this.props.setAlert('warning', "Address too " + (address.length < 40 ? "short" : "long") + ".");
    }
    else {
      this.setState({
        newSend: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newSend: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    var payload = {
        recipient: "0x" + this.state.recipient,
        amount: bigRat(this.state.amount).multiply(Math.pow(10, this.props.market.decimals)).toDecimal()
    };

    this.getFlux().actions.user.sendSub(payload);

    this.refs.address.getDOMNode().value = '';
    this.refs.amount.getDOMNode().value = '';

    this.setState({
        recipient: null,
        amount: null,
        newSend: false
    });
  }
});

module.exports = SubSend;
