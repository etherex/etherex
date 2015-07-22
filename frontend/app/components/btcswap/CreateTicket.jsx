var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var ConfirmModal = require('../ConfirmModal');
var AlertDismissable = require('../AlertDismissable');
var Nav = require("./Nav");

var CreateTicket = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isValid: false,
      showModal: false,
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function(show) {
    this.refs.alerts.setState({alertVisible: show});
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  validate: function(showAlerts) {
    var address = this.refs.address.getValue();
    var amount = this.refs.amount.getValue().trim();
    var btc = this.refs.btc.getValue().trim();

    this.setState({
      address: address,
      amount: amount,
      btc: btc,
      price: (parseFloat(btc) / parseFloat(amount)).toFixed(8)
    });

    if (!amount || !btc || !address) {
      this.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else {
      this.setState({
        isValid: true,
        confirmMessage: <FormattedMessage
                          message={this.getIntlMessage('btc.sell')}
                          amount={this.state.amount}
                          unit="ETH"
                          total={this.state.btc}
                          price={this.state.price}
                          address=<samp>{this.state.address}</samp> />
      });

      this.showAlert(false);

      return true;
    }

    this.setState({
      isValid: false
    });

    if (showAlerts)
      this.showAlert(true);

    return false;
  },

  handleChange(e) {
    e.preventDefault();
    this.validate(false);
  },

  handleValidation(e) {
    e.preventDefault();
    if (this.validate(true))
      this.openModal();
  },

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validate(true))
      return false;

    this.props.flux.actions.ticket.createTicket(this.state.address, this.state.amount, this.state.btc);

    this.setState({
        address: null,
        amount: null,
        btc: null,
        price: null,
        isValid: false
    });
  },

  render() {
    return (
      <div>
        <Nav flux={this.props.flux} ticket={this.props.ticket} />

        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="col-md-6 col-md-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                Offer your ether for bitcoin
              </h3>
            </div>
            <div className="panel-body">
              <form role="form" onSubmit={this.handleValidation}>
                <Input type="text" ref="address" label="Bitcoin address" className="form-control"
                  minLength="26" maxLength="35" pattern="[13m][a-km-zA-HJ-NP-Z1-9]{25,34}"
                  value={this.state.address}
                  onChange={this.handleChange}
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

                <Input type="number" ref="price" label="Price ETH/BTC" className="form-control" readOnly
                  value={this.state.price}
                  help="Effectively how many BTC you are asking for each ETH" />

                <Button className={"btn-block" + (this.state.isValid ? " btn-primary" : "")}
                  type="submit"
                  disabled={!this.state.isValid} >
                  Submit offer
                </Button>
              </form>
            </div>
          </div>
        </div>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={this.state.confirmMessage}
          flux={this.props.flux}
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
});

module.exports = CreateTicket;
