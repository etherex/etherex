/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var AlertDismissable = require('./AlertDismissable');

var ProgressBar = require('react-bootstrap/lib/ProgressBar');

var TxsTable = require('./TxsTable');

var TxsList = React.createClass({
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
                {this.props.market.market.error &&
                    <AlertDismissable ref="alerts" level={"warning"} message={this.props.market.market.error} show={true} />}
                <div className="container-fluid">
                    <TxsTable txs={this.props.txs} market={this.props.market} user={this.props.user.user} />
                </div>
            </div>
        );
    }
});

module.exports = TxsList;
