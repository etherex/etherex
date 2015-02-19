/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var fixtures = require("../js/fixtures");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var SubDepositModal = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      amount: this.props.amount,
      newDeposit: false
    };
  },

  componentDidMount: function() {
    this.validate(new Event);
  },

  render: function() {
    return (
      <Modal {...this.props} title={this.props.title} animation={true}>
        <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
          <div className="modal-body">
            <label forHtml="amount">Amount</label>
            <input type="number" min="0.0001" step="0.00000001" className="form-control" placeholder="10.0000" ref="amount" onChange={this.handleChange} value={this.state.amount} />
          </div>
          <div className="modal-footer">
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
      </Modal>
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
      this.props.owner.setState({
        alertLevel: 'warning',
        alertMessage: "Dont' be cheap..."
      });
    }
    else if (amount > this.props.user.balance_sub) {
      this.props.owner.setState({
        alertLevel: 'warning',
        alertMessage: "Not enough " + this.props.market.name + " for deposit, got " + utils.format(this.props.user.balance_sub) + ", needs " + utils.format(amount)
      });
    }
    else {
      this.setState({
        newDeposit: true
      });

      this.props.owner.refs.alerts.setState({alertVisible: false});

      return true;
    }

    this.setState({
      newDeposit: false
    });

    if (showAlerts)
      this.props.owner.refs.alerts.setState({alertVisible: true});

    e.stopPropagation();
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false

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

module.exports = SubDepositModal;
