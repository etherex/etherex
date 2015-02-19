/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var AlertDismissable = require('./AlertDismissable');

var SubRegister = require('./SubRegister');

var TradeList = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  render: function() {
    return (
      <div>
        <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />

        <div className="container col-md-6 col-md-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Subcurrency registration</h3>
            </div>
            <div className="panel-body">
              <div className="container-fluid">
                <SubRegister markets={this.props.market.markets} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TradeList;
