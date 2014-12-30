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

var SubDeposit = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      amount: null,
      newDeposit: false
    };
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <div className="form-group">
          <label className="sr-only" forHtml="amount">Amount</label>
          <input type="number" min="0.0001" step="0.00000001" className="form-control" placeholder="10.0000" ref="amount" onChange={this.handleValidation} />
        </div>
        <div className="form-group">
          {this.state.newDeposit ?
            <ModalTrigger modal={
                <ConfirmModal
                  message={
                    "Are you sure you want to deposit" +
                      " " + utils.numeral(this.state.amount, 4) + " " + this.props.market.name + " ?"}
                  flux={this.getFlux()}
                  onSubmit={this.onSubmitForm}
                />
              }>
              <Button className="btn-block btn-primary" type="submit" key="deposit">Deposit</Button>
            </ModalTrigger>
          : <Button className="btn-block" type="submit" key="deposit_fail">Deposit</Button>}
        </div>
      </form>
    );
  },

  handleValidation: function(e, showAlerts) {
    e.preventDefault();

    var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());

    this.setState({
      amount: amount
    });

    if (!amount) {
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Dont' be cheap..."
      });
    }
    else {
      this.setState({
        newDeposit: true
      });

      this._owner.refs.alerts.setState({alertVisible: false});

      return true;
    }

    this.setState({
      newDeposit: false
    });

    if (showAlerts)
      this._owner.refs.alerts.setState({alertVisible: true});

    e.stopPropagation();
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.handleValidation(e, el))
      e.stopPropagation()

    this.getFlux().actions.user.depositSub({
      amount: bigRat(this.state.amount).multiply(Math.pow(10, this.props.market.decimals)).toDecimal()
    });

    this.refs.amount.getDOMNode().value = '';

    this.setState({
      amount: null,
      newDeposit: false
    });
  }
});

module.exports = SubDeposit;
