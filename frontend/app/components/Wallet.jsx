var React = require("react");
import {injectIntl, FormattedMessage} from 'react-intl';

var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');

var AlertDismissable = require('./AlertDismissable');

var SendEther = require('./SendEther');
var SubSend = require('./SubSend');
var SubDeposit = require('./SubDeposit');
var SubWithdraw = require('./SubWithdraw');

var TxsList = require("./TxsList");

var Wallet = injectIntl(React.createClass({
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

  deposit() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='deposit.currency' values={{currency: this.props.market.market.name}} />
          </h3>
        </div>
        <div className="panel-body">
          <div className="container-fluid">
            <SubDeposit flux={this.props.flux} market={this.props.market.market} user={this.props.user.user}
              setAlert={this.setAlert} showAlert={this.showAlert} />
          </div>
        </div>
      </div>
    );
  },
  withdraw() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='withdraw.currency' values={{currency: this.props.market.market.name}} />
          </h3>
        </div>
        <div className="panel-body">
          <div className="container-fluid">
            <SubWithdraw flux={this.props.flux} market={this.props.market.market} user={this.props.user.user}
              setAlert={this.setAlert} showAlert={this.showAlert} />
          </div>
        </div>
      </div>
    );
  },
  transfer() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='send.currency' values={{currency: this.props.market.market.name}} />
          </h3>
        </div>
        <div className="panel-body">
          <div className="container-fluid">
            <SubSend flux={this.props.flux} market={this.props.market.market} user={this.props.user.user}
              setAlert={this.setAlert} showAlert={this.showAlert} />
          </div>
        </div>
      </div>
    );
  },
  sendEther() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='send.currency' values={{currency: "ETH"}} />
          </h3>
        </div>
        <div className="panel-body">
          <div className="container-fluid">
            <SendEther flux={this.props.flux} user={this.props.user.user}
              setAlert={this.setAlert} showAlert={this.showAlert} />
          </div>
        </div>
      </div>
    );
  },

  render() {
    return (
      <div>
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="hidden-xs hidden-sm">
          <Tabs defaultActiveKey={1} position='left' tabWidth={3}>
            <Tab eventKey={1} title={ this.props.intl.formatMessage({id: 'deposit.currency'}, {currency: this.props.market.market.name}) }>
              { this.deposit() }
            </Tab>
            <Tab eventKey={2} title={ this.props.intl.formatMessage({id: 'withdraw.currency'}, {currency: this.props.market.market.name}) }>
              { this.withdraw() }
            </Tab>
            <Tab eventKey={3} title={ this.props.intl.formatMessage({id: 'send.currency'}, {currency: this.props.market.market.name}) }>
              { this.transfer() }
            </Tab>
            <Tab eventKey={4} title={ this.props.intl.formatMessage({id: 'send.currency'}, {currency: "ETH"}) }>
              { this.sendEther() }
            </Tab>
          </Tabs>
        </div>
        <div className="visible-xs visible-sm">
          { this.deposit() }
          { this.withdraw() }
          { this.transfer() }
          { this.sendEther() }
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

}));

module.exports = Wallet;
