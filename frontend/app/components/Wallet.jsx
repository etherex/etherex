/** @jsx React.DOM */

var React = require("react");

var AlertDismissable = require('./AlertDismissable');

var SendEther = require('./SendEther');

var SubSend = require('./SubSend');
var SubDeposit = require('./SubDeposit');
var SubWithdraw = require('./SubWithdraw');

var TxsList = require("./TxsList");

var Markets = React.createClass({

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
    return (
      <div>
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="container-fluid">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Deposit {this.props.market.market.name}</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubDeposit flux={this.props.flux} market={this.props.market.market} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Withdraw {this.props.market.market.name}</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubWithdraw flux={this.props.flux} market={this.props.market.market} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Send {this.props.market.market.name}</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SubSend flux={this.props.flux} market={this.props.market.market} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Send Ether</h3>
              </div>
              <div className="panel-body">
                <div className="container-fluid">
                  <SendEther flux={this.props.flux} user={this.props.user.user} setAlert={this.setAlert} showAlert={this.showAlert}  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            {(!this.props.market.market.txs.error) &&
              <TxsList title="Transactions" flux={this.props.flux} market={this.props.market} txs={this.props.market.market.txs} user={this.props.user} />}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Markets;
