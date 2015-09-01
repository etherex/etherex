var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var ConfirmModal = require('./ConfirmModal');

var SubSend = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      amount: null,
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

    var address = this.refs.address.getValue().trim();
    var amount = this.refs.amount.getValue().trim();

    this.setState({
      recipient: address,
      amount: amount
    });

    if (!address) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else if (!amount) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.cheap')));
    }
    else if (parseFloat(amount) > this.props.user.balanceSub) {
      this.props.setAlert('warning',
        this.formatMessage(this.getIntlMessage('sub.not_enough'), {
          currency: this.props.market.name,
          balance: this.props.user.balanceSub
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
                            currency={this.props.market.name}
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
        recipient: this.state.recipient,
        amount: this.state.amount
    };

    this.props.flux.actions.user.sendSub(payload);

    this.setState({
        recipient: null,
        amount: null,
        newSend: false
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <Input type="text" ref="address"
          placeholder="0x"
          label={<FormattedMessage message={this.getIntlMessage('form.recipient')} />} labelClassName="sr-only"
          maxLength="42" pattern="0x[a-fA-F\d]+"
          onChange={this.handleChange}
          value={this.state.recipient} />

        <Input type="number" ref="amount"
          label={<FormattedMessage message={this.getIntlMessage('form.amount')} />} labelClassName="sr-only"
          min={this.props.market.amountPrecision}
          step={this.props.market.amountPrecision}
          placeholder="10.0000"
          onChange={this.handleChange}
          value={this.state.amount} />

        <div className="form-group">
          <Button className={"btn-block" + (this.state.newSend ? " btn-primary" : "")} type="submit" key="send">
            <FormattedMessage message={this.getIntlMessage('send.send')} />
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

module.exports = SubSend;
