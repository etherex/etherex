/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var AlertDismissable = require('./AlertDismissable');

var ProgressBar = require('react-bootstrap/lib/ProgressBar');

var MarketTable = require('./MarketTable');

var MarketList = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return (
            <div>
                <div className="container-fluid row">
                  {this.props.title ?
                    <div className="col-md-3 col-xs-6">
                        <h3>{this.props.title} {this.props.market.loading && <span>loading...</span>}</h3>
                    </div> : "" }
                  {this.props.market.loading ?
                    <div className="col-md-9 col-xs-6">
                      <div style={{marginTop: 28}}>
                        <ProgressBar active now={this.props.market.percent} className="" />
                      </div>
                    </div> : "" }
                </div>
                {this.props.market.error &&
                    <AlertDismissable ref="alerts" level={"warning"} message={this.props.market.error} show={true} />}
                <div className="container-fluid">
                    <MarketTable category={this.props.category} market={this.props.market} />
                </div>
            </div>
        );
    }
});

module.exports = MarketList;
