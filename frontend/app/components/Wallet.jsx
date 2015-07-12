var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var AlertDismissable = require('./AlertDismissable');

var SendEther = require('./SendEther');

var SubSend = require('./SubSend');
var SubDeposit = require('./SubDeposit');
var SubWithdraw = require('./SubWithdraw');

var TxsList = require("./TxsList");

var Wallet = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  componentDidMount() {
    this.props.flux.actions.config.updateAlertCount(null);
  },

  setAlert(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert(show) {
    this.refs.alerts.setState({alertVisible: show});
  },

  render() {
    return (
      <div>
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="container-fluid">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <FormattedMessage message={this.getIntlMessage('deposit.currency')}
                                    currency={this.props.market.market.name} />
                </h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubDeposit flux={this.props.flux} market={this.props.market.market} user={this.props.user.user}
                              setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <FormattedMessage message={this.getIntlMessage('withdraw.currency')}
                                    currency={this.props.market.market.name} />
                </h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubWithdraw flux={this.props.flux} market={this.props.market.market} user={this.props.user.user}
                               setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <FormattedMessage message={this.getIntlMessage('send.currency')}
                                    currency={this.props.market.market.name} />
                </h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubSend flux={this.props.flux} market={this.props.market.market} user={this.props.user.user}
                           setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <FormattedMessage message={this.getIntlMessage('send.currency')}
                                    currency="ETH" />
                </h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SendEther flux={this.props.flux} user={this.props.user.user}
                             setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            {(!this.props.market.market.txs.error) &&
              <TxsList title="Transactions" flux={this.props.flux} market={this.props.market}
                       txs={this.props.market.market.txs} user={this.props.user} />}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Wallet;
