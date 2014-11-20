/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var constants = require("../constants");
var ProgressBar = require("./ProgressBar");

var TradeActionButtons = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        if (this.props.trade.state === constants.state.NEW && this.props.trade.buyerId !== this.props.users.currentUserId && this.props.trade.sellerId !== this.props.users.currentUserId) {
            return (
                <div className="row spacer">
                    <div className="col-xs-4">
                        <button type="button" className="btn btn-default" onClick={this.onAcceptButton}>Accept Trade</button>
                    </div>
                </div>
            );
        } else if (this.props.trade.state === constants.state.NEW || this.props.trade.state === constants.state.ACCEPTED) {
            return (
                <div className="row spacer">
                    <div className="col-xs-4">
                        <button type="button" className="btn btn-default" onClick={this.onCancelButton}>Cancel</button>
                    </div>
                </div>
            );
        } else if (this.props.trade.state === constants.state.INSURED) {
            return (
                <div className="row spacer">
                    <div className="col-xs-4">
                        <button type="button" className="btn btn-success" disabled="disabled">Success</button>
                    </div>
                    <div className="col-xs-4">
                        <button type="button" className="btn btn-danger" disabled="disabled">Fail</button>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    },

    onAcceptButton: function() {
        this.getFlux().actions.trade.acceptTrade(this.props.trade);
    },

    onCancelButton: function() {
        this.getFlux().actions.trade.cancelTrade(this.props.trade);
    }
});

var TradeStatusPane = React.createClass({
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">Status</h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-xs-4">
                            Escrow
                        </div>
                        <div className="col-xs-8">
                            <ProgressBar pct={this.props.trade.escrowPct || 0} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-4">
                            Insurance
                        </div>
                        <div className="col-xs-8">
                            <ProgressBar pct={this.props.trade.insurancePct || 0} />
                        </div>
                    </div>
                    <div className="row spacer">
                        <div className="col-xs-4">
                            Status
                        </div>
                        <div className="col-xs-8">
                            {this.props.trade.state}
                        </div>
                    </div>
                    <TradeActionButtons trade={this.props.trade} users={this.props.users} />
                </div>
            </div>
        );
    }
});

module.exports = TradeStatusPane;
