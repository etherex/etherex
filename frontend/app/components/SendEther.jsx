var _ = require('lodash');
var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var ConfirmModal = require('./ConfirmModal');

var fixtures = require("../js/fixtures");
var bigRat = require("big-rational");

var SubSend = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      amount: 0,
      recipient: null,
      newSend: false,
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

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <div className="container-fluid row">
          <div className="form-group">
            <label className="sr-only" forHtml="address">
              <FormattedMessage message={this.getIntlMessage('form.address')} />
            </label>
            <input ref="address" type="text" className="form-control"
                   maxLength="42" pattern="0x[a-fA-F\d]+" placeholder="0x"
                   onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <label className="sr-only" forHtml="amount">
              <FormattedMessage message={this.getIntlMessage('form.amount')} />
            </label>
            <input ref="amount" type="number" className="form-control"
              min={1 / _.parseInt(fixtures.ether)} step={1 / _.parseInt(fixtures.ether)} placeholder="10.0000"
              onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <Button className={"btn-block" + (this.state.newSend ? " btn-primary" : "")} type="submit" key="send">
              <FormattedMessage message={this.getIntlMessage('send.send')} />
            </Button>
          </div>
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

    var address = this.refs.address.getDOMNode().value.trim();
    var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());

    this.setState({
      recipient: address,
      amount: amount
    });

    if (!address || !amount) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else if (!amount) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.cheap')));
    }
    else if (amount > this.props.user.balance_raw) {
      this.props.setAlert('warning', this.formatMessage(
        this.getIntlMessage('send.not_enough'), {
          currency: "ETH",
          balance: this.props.user.balance
        })
      );
    }
    else if (address.length != 42) {
      this.props.setAlert('warning',
        this.formatMessage(this.getIntlMessage('address.size'), {
          size: (address.length < 42 ? "short" : "long")
        })
      );
    }
    else {
      this.setState({
        newSend: true,
        confirmMessage: <FormattedMessage
                          message={this.getIntlMessage('sub.send')}
                          amount={this.state.amount}
                          currency="ETH"
                          recipient={this.state.recipient} />
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
        amount: bigRat(this.state.amount).multiply(fixtures.ether).toDecimal()
    };

    this.props.flux.actions.user.sendEther(payload);

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
