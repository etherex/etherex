var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var ConfirmModal = require('./ConfirmModal');

var SubDeposit = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      amount: null,
      newDeposit: false,
      showModal: false,
      confirmMessage: null
    };
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    if (this.validate(e, true))
      this.openModal();
  },

  validate: function(e, showAlerts) {
    e.preventDefault();

    var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());

    this.setState({
      amount: amount
    });

    if (!amount) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else if (amount > this.props.user.balanceSub) {
      this.props.setAlert('warning',
        this.formatMessage(this.getIntlMessage('deposit.not_enough'), {
          currency: this.props.market.name,
          balance: this.props.user.balanceSub,
          amount: amount
        })
      );
    }
    else {
      this.setState({
        newDeposit: true,
        confirmMessage: <FormattedMessage message={this.getIntlMessage('deposit.confirm')}
                                          amount={amount}
                                          currency={this.props.market.name} />
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newDeposit: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    e.stopPropagation();
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.props.flux.actions.user.depositSub({
      amount: this.state.amount
    });

    this.refs.amount.getDOMNode().value = '';

    this.setState({
      amount: null,
      newDeposit: false
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <div className="form-group">
          <label className="sr-only" forHtml="amount">
            <FormattedMessage message={this.getIntlMessage('form.amount')} />
          </label>
          <input ref="amount" type="number" className="form-control"
            min={this.props.market.amountPrecision}
            step={this.props.market.amountPrecision}
            placeholder="10.0000"
            onChange={this.handleChange} />
        </div>
        <div className="form-group">
          <Button className={"btn-block" + (this.state.newDeposit ? " btn-primary" : "")} type="submit">
            <FormattedMessage message={this.getIntlMessage('form.deposit')} />
          </Button>
        </div>
        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={this.state.confirmMessage}
          flux={this.props.flux}
          onSubmit={this.onSubmitForm}
        />
      </form>
    );
  }
});

module.exports = SubDeposit;
