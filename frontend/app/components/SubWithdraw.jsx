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

var SubWithdraw = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      amount: null,
      recipient: null,
      newWithdrawal: false
    };
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <div className="form-group">
          <label className="sr-only" forHtml="amount">Amount</label>
          <input type="number" min="0.0001" step="0.00000001" className="form-control" placeholder="10.0000" ref="amount" onChange={this.handleChange} />
        </div>
        <div className="form-group">
          {this.state.newWithdrawal ?
            <ModalTrigger modal={
                <ConfirmModal
                  message={
                    "Are you sure you want to withdraw" +
                      " " + utils.numeral(this.state.amount, 4) + " " + this.props.market.name + " ?"}
                  flux={this.getFlux()}
                  onSubmit={this.onSubmitForm}
                />
              }>
              <Button className="btn-block btn-primary" type="submit" key="withdraw">Withdraw</Button>
            </ModalTrigger>
          : <Button className="btn-block" type="submit" key="withdraw_fail">Withdraw</Button>}
        </div>
      </form>
    );
  },

  handleChange: function(e, showAlerts) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e, showAlerts) {
    e.preventDefault();
    this.validate(e, true);
  },

  validate: function(e, showAlerts) {
    e.preventDefault();

    var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());

    this.setState({
      amount: amount
    });

    if (!amount) {
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Dont' be cheap to yourself..."
      });
    }
    else {
      this.setState({
        newWithdrawal: true
      });

      this._owner.refs.alerts.setState({alertVisible: false});

      return true;
    }

    this.setState({
      newWithdrawal: false
    });

    if (showAlerts)
      this._owner.refs.alerts.setState({alertVisible: true});

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.getFlux().actions.user.withdrawSub({
      amount: bigRat(this.state.amount).multiply(Math.pow(10, this.props.market.decimals)).toDecimal()
    });

    this.refs.amount.getDOMNode().value = '';

    this.setState({
      amount: null,
      newWithdrawal: false
    });
  }
});

module.exports = SubWithdraw;
