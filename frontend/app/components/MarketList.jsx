/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var AlertDismissable = require('./AlertDismissable');

var ProgressBar = require('react-bootstrap/ProgressBar');

var MarketTable = require('./MarketTable');

var MarketList = React.createFactory(React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return (
            <div>
                <div className="container-fluid row">
                    <div className="col-md-3 col-xs-6">
                        <h3>{this.props.title} {this.props.market.loading && <span>loading...</span>}</h3>
                    </div>
                    <div className="col-md-9 col-xs-6">
                        <div style={{marginTop: 28}}>
                            {this.props.market.loading &&
                                <ProgressBar active now={this.props.market.percent} className="" />}
                        </div>
                    </div>
                </div>
                {this.props.market.error &&
                    <AlertDismissable ref="alerts" level={"alert"} message={this.props.market.error} show={true} />}
                <div className="container-fluid">
                    <MarketTable market={this.props.market} />
                </div>
            </div>
        );
    }
}));

module.exports = MarketList;
