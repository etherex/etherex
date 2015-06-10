/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var AlertDismissable = require('./AlertDismissable');

var SendEther = require('./SendEther');

var SubSend = require('./SubSend');
var SubDeposit = require('./SubDeposit');
var SubWithdraw = require('./SubWithdraw');

// var MarketFilter = require("./MarketFilter"); TODO
var MarketList = require("./MarketList");
var TxsList = require("./TxsList");

var Markets = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
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

  render: function() {
    // console.log(this.props);
    // <MarketFilter market={this.props.market} trades={this.props.trades} user={this.props.user} />
    return (
      <div>
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="container-fluid">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Withdraw {this.props.market.market.name}</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubWithdraw market={this.props.market.market} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Deposit {this.props.market.market.name}</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubDeposit market={this.props.market.market} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="col-md-6 col-md-offset-3">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Send {this.props.market.market.name}</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubSend market={this.props.market.market} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="col-md-6 col-md-offset-3">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Send ETH</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SendEther user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            {(!this.props.market.market.txs.error) &&
              <TxsList title="Transactions" market={this.props.market} txs={this.props.market.market.txs} user={this.props.user} />}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Markets;
