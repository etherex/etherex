/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var AlertDismissable = require('./AlertDismissable');

var RegisterSub = require('./RegisterSub');
var Send = require('./Send');

var TradeList = React.createClass({
    mixins: [FluxChildMixin],

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

                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">Subcurrency registration</h3>
                  </div>
                  <div className="panel-body">
                    <div className="container-fluid">
                        <RegisterSub markets={this.props.market.markets} />
                    </div>
                  </div>
                </div>

                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">Send</h3>
                  </div>
                  <div className="panel-body">
                    <div className="container-fluid">
                        <Send />
                    </div>
                  </div>
                </div>
            </div>
        );
    }
});

module.exports = TradeList;
