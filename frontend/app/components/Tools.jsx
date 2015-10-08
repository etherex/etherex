var React = require("react");
var Perf = require("react-addons-perf");
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
    if (this.props.flux.stores.config.debug && Perf) {
      var measurements = Perf.stop();
      Perf.printInclusive(measurements);
      utils.debug("Inclusive", "^");
      Perf.printExclusive(measurements);
      utils.debug("Exclusive", "^");
      Perf.printWasted(measurements);
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
      <div className="row">
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="col-md-4">
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
        <div className="col-md-8">
          <ConfigPane flux={this.props.flux} address={address} setAlert={this.setAlert} showAlert={this.showAlert} />
        </div>

        <div className="container col-md-12 visible-md visible-sm visible-xs">
          <Network flux={this.props.flux} />
        </div>
      </div>
    );
  }
});

module.exports = TradeList;
