/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var TradeSummaryPane = require("./TradeSummaryPane");
var TradeStatusPane = require("./TradeStatusPane");
var TradeReferenceList = require("./TradeReferenceList");

var TradeDetails = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        var trade = this.props.trades.tradeById[this.props.params.tradeId];
        if (trade) {
            return (
                <div>
                    <div className="row">
                        <div className="col-sm-6">
                            <TradeSummaryPane trade={trade} user={this.props.users.currentUser} />
                        </div>
                        <div className="col-sm-6">
                            <TradeStatusPane trade={trade} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <h3 className="visible-xs-block">References</h3>
                            <h3 className="hidden-xs">References for this trade</h3>
                        </div>
                        <div className="col-xs-6 text-right">
                            <button type="button" className="btn btn-default" disabled="disabled">Insure this trade</button>
                        </div>
                    </div>
                    <TradeReferenceList tradeReferenceList={trade.references || []} />
                </div>
            );
        } else {
            return (
                    <h3>Trade not found</h3>
            );
        }
    }
});

module.exports = TradeDetails;
