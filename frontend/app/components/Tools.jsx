var React = require("react");
var utils = require("../js/utils");

var AlertDismissable = require('./AlertDismissable');

var Network = require('./Network');
var ConfigPane = require("./ConfigPane");
var SubRegister = require('./SubRegister');

var TradeList = React.createClass({

  getInitialState: function() {
    return {
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  componentDidMount: function() {
    if (this.props.flux.store('config').getState().debug && React.addons.Perf) {
      var measurements = React.addons.Perf.stop();
      React.addons.Perf.printInclusive(measurements);
      utils.debug("Inclusive", "^");
      React.addons.Perf.printExclusive(measurements);
      utils.debug("Exclusive", "^");
      React.addons.Perf.printWasted(measurements);
      utils.debug("Wasted", "^");
    }
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
    var address = this.props.flux.stores.config.getState().address;

    return (
      <div className="container-fluid row">
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <ConfigPane flux={this.props.flux} address={address} setAlert={this.setAlert} showAlert={this.showAlert} />

        <div className="container col-md-6 col-md-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Subcurrency registration</h3>
            </div>
            <div className="panel-body">
              <div className="container-fluid">
                <SubRegister flux={this.props.flux} address={address} markets={this.props.market.markets} setAlert={this.setAlert} showAlert={this.showAlert} />
              </div>
            </div>
          </div>
        </div>
        <div className="container col-md-12 visible-md visible-sm visible-xs">
          <Network flux={this.props.flux} />
        </div>
      </div>
    );
  }
});

module.exports = TradeList;
