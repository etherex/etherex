/** @jsx React.DOM */

var React = require("react");

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var utils = require("../js/utils");
var bigRat = require("big-rational");

var SubDepositModal = React.createClass({

  getInitialState: function() {
    return {
      isModalOpen: true,
      amount: this.props.amount,
      newDeposit: false
    };
  },

  componentDidMount: function() {
    this.validate(new Event('validate'));
  },

  handleToggle: function() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

  render: function() {
    if (!this.state.isModalOpen)
      return <span/>;

    return (
      <Modal {...this.props} title={this.props.title} animation={true} enforceFocus={false} onRequestHide={this.handleToggle}>
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
                    flux={this.props.flux}
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
    e.stopPropagation();

    var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());

    this.setState({
      amount: amount
    });

    if (!amount)
      this.props.setAlert('warning', "Dont' be cheap...");
    else if (amount > this.props.user.balance_sub)
      this.props.setAlert('warning', "Not enough " + this.props.market.name + " for deposit, got " + utils.format(this.props.user.balance_sub) + ", needs " + utils.format(amount));
    else {
      this.setState({
        newDeposit: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newDeposit: false
    });

    if (showAlerts) {
      this.props.showAlert(true);
      this.handleToggle();
      this.props.onRequestHide();
    }

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el)) {
      this.props.onRequestHide();
      return false;
    }

    this.props.flux.actions.user.depositSub({
      amount: bigRat(this.state.amount).multiply(Math.pow(10, this.props.market.decimals)).toDecimal()
    });

    this.refs.amount.getDOMNode().value = '';

    this.setState({
      amount: null,
      newDeposit: false
    });

    this.handleToggle();
    this.props.onRequestHide();
  }
});

module.exports = SubDepositModal;
