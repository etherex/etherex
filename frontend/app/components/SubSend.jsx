/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");

var Button = require('react-bootstrap/Button');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
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
          <div className="col-md-10 col-md-offset-1">
            <div className="form-group">
              <label className="sr-only" forHtml="address">Address</label>
              <input type="text" className="form-control" pattern="\w{1,40}" placeholder="Address" ref="address" size="40" onChange={this.handleChange} />
            </div>
          </div>
          <div className="col-md-8 col-md-offset-2">
            <div className="form-group">
              <label className="sr-only" forHtml="amount">Amount</label>
              <input type="number" min="0.0001" step="0.00000001" className="form-control" placeholder="10.0000" ref="amount" onChange={this.handleChange} />
            </div>
          </div>
          <div className="col-md-8 col-md-offset-2">
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
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Fill it up mate!"
      });
    }
    else if (!amount) {
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Dont' be cheap..."
      });
    }
    else if (address.length != 40) {
        this._owner.setState({
          alertLevel: 'warning',
          alertMessage: "Address too " + (address.length < 40 ? "short" : "long") + "."
        });
    }
    else {
      this.setState({
        newSend: true
      });

      this._owner.refs.alerts.setState({alertVisible: false});

      return true;
    }

    this.setState({
      newSend: false
    });

    if (showAlerts)
      this._owner.refs.alerts.setState({alertVisible: true});

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
