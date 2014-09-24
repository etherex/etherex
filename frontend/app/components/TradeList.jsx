/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var ProgressBar = require('react-bootstrap/ProgressBar');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var Table = require("react-bootstrap/Table");
var Button = require("react-bootstrap/Button");
var Glyphicon = require("react-bootstrap/Glyphicon");

var utils = require("../js/utils");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TradeRow = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        var isOwn = (this.props.trade.owner == this.props.user.id);
        return (
            <tr className={"trade-" + this.props.trade.status + ((isOwn && !this.props.user.own) ? " disabled" : "")}>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.trade.amount, 2)}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {this.props.trade.market.name}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.trade.price, 4)}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.trade.total, 2)} ETH
                    </div>
                </td>
                <td>
                    <div className="center-block ellipsis">
                        {this.props.trade.owner}
                    </div>
                </td>
                <td className="trade-op">
                    <div className="pull-right">{
                    (this.props.trade.owner == this.props.user.id) ?
                        <ModalTrigger modal={
                                <ConfirmModal
                                    type="cancel"
                                    message="Are you sure you want to cancel this trade?"
                                    trade={this.props.trade}
                                    flux={this.getFlux()}
                                    onSubmit={this.handleCancelTrade}
                                />
                            }>
                            <Button key="cancel"><Glyphicon glyph="remove" /></Button>
                        </ModalTrigger> :

                        <ModalTrigger modal={
                                <ConfirmModal
                                    type="fill"
                                    message={
                                        "Are you sure you want to " + (this.props.trade.type == "buy" ? "sell" : "buy") +
                                        " " + this.props.trade.amount + " " + this.props.trade.market.name +
                                        " at " + this.props.trade.price + " " + this.props.trade.market.name + "/ETH" +
                                        " for " + (this.props.trade.amount / this.props.trade.price) + " ETH"
                                    }
                                    flux={this.getFlux()}
                                    onSubmit={this.handleFillTrade}
                                />
                            }>
                            <Button key="fill"><Glyphicon glyph="screenshot" /></Button>
                        </ModalTrigger>
                    }</div>
                </td>
            </tr>
        );
    },

    handleFillTrade: function(e) {
        this.getFlux().actions.trade.fillTrade(this.props.trade);
    },

    handleCancelTrade: function(e) {
        this.getFlux().actions.trade.cancelTrade(this.props.trade);
    }
});

var TradeTable = React.createClass({
    render: function() {
        var tradeListNodes = this.props.tradeList.map(function (trade) {
            return (
                <TradeRow key={trade.id} trade={trade} user={this.props.user} />
            );
        }.bind(this));
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-right">Amount</th>
                            <th className="text-center">Market</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total</th>
                            <th className="text-center">By</th>
                            <th className="text-center trade-op"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tradeListNodes}
                    </tbody>
                </Table>
            </div>
        );
    }
});

var TradeBuys = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <div className="col-md-6">
                <TradeTable title="Buys" tradeList={this.props.trades.tradeBuys} user={this.props.user.user} />
            </div>
        );
    }
});

var TradeSells = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <div className="col-md-6">
                <TradeTable title="Sells" tradeList={this.props.trades.tradeSells} user={this.props.user.user} />
            </div>
        );
    }
});

var TradeList = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <div>
                <div className="container-fluid row">
                    <div className="col-md-3 col-xs-6">
                        <h3>{this.props.trades.title} {this.props.trades.loading && <span>loading...</span>}</h3>
                    </div>
                    <div className="col-md-9 col-xs-6">
                        <div style={{marginTop: 28}}>
                            {this.props.trades.loading &&
                                <ProgressBar active now={this.props.trades.percent} className="" />}
                        </div>
                    </div>
                </div>
                {this.props.trades.error &&
                    <AlertDismissable ref="alerts" level={"alert"} message={this.props.trades.error} />}
                {(this.props.trades.type == 1) ?
                <div>
                    <TradeSells trades={this.props.trades} user={this.props.user} />
                    <TradeBuys trades={this.props.trades} user={this.props.user} />
                </div> :
                <div>
                    <TradeBuys trades={this.props.trades} user={this.props.user} />
                    <TradeSells trades={this.props.trades} user={this.props.user} />
                </div>
                }
            </div>
        );
    }
});

module.exports = TradeList;
