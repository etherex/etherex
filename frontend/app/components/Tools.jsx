/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var AlertDismissable = require('./AlertDismissable');

var Network = require('./Network');
var ConfigPane = require("./ConfigPane");
var SubRegister = require('./SubRegister');

var TradeList = React.createClass({
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
    var address = this.getFlux().stores.config.getState().address;

    return (
      <div>
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <ConfigPane address={address} setAlert={this.setAlert} showAlert={this.showAlert} />

        <div className="container col-md-6 col-md-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Subcurrency registration</h3>
            </div>
            <div className="panel-body">
              <div className="container-fluid">
                <SubRegister markets={this.props.market.markets} setAlert={this.setAlert} showAlert={this.showAlert} />
              </div>
            </div>
          </div>
        </div>
        <div className="container col-md-12 visible-md visible-sm visible-xs">
          <Network />
        </div>
      </div>
    );
  }
});

module.exports = TradeList;
