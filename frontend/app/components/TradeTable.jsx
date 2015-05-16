/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var Table = require("react-bootstrap/lib/Table");
var Button = require("react-bootstrap/lib/Button");
var Glyphicon = require("react-bootstrap/lib/Glyphicon");

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TradeRow = React.createClass({
    mixins: [FluxMixin],

    getInitialState: function() {
        return {
            payload: {}
        };
    },

    render: function() {
        var isOwn = (this.props.trade.owner == this.props.user.id);
        var market = this.props.market.markets[this.props.trade.market.id - 1];
        var precision = String(market.precision).length - 1;
        return (
            <tr className={"trade-" + (!this.props.review ? this.props.trade.status : "review") + ((isOwn && !this.props.user.own) ? " disabled" : "")} onMouseEnter={this.handleHover} onMouseLeave={this.handleHoverOut} onClick={this.handleClick}>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.trade.amount, market.decimals)}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {this.props.trade.market.name}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.trade.price, precision)}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.trade.total, 4)} ETH
                    </div>
                </td>
                <td>
                    <div className="center-block ellipsis">
                        {this.props.trade.owner}
                    </div>
                </td>
                {!this.props.review &&
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
                            <Button className="btn-xs" key="cancel"><Glyphicon glyph="remove" /></Button>
                        </ModalTrigger> :

                        <ModalTrigger modal={
                                <ConfirmModal
                                    type="fill"
                                    message={
                                        "Are you sure you want to " + (this.props.trade.type == "buys" ? "sell" : "buy") +
                                        " " + this.props.trade.amount + " " + this.props.trade.market.name +
                                        " at " + this.props.trade.price + " " + this.props.trade.market.name + "/ETH" +
                                        " for " + (this.props.trade.amount * this.props.trade.price) + " ETH"
                                    }
                                    flux={this.getFlux()}
                                    onSubmit={this.handleFillTrade}
                                />
                            }>
                            <Button className="btn-xs" key="fill"><Glyphicon glyph="screenshot" /></Button>
                        </ModalTrigger>
                    }</div>
                </td>}
            </tr>
        );
    },

    handleFillTrade: function(e) {
        this.getFlux().actions.trade.fillTrade(this.props.trade);
    },

    handleCancelTrade: function(e) {
        this.getFlux().actions.trade.cancelTrade(this.props.trade);
    },

    handleHover: function(e) {
        if (this.props.review)
            return;

        if (!this.props.trade.price || !this.props.trade.amount || !this.props.trade.total)
            return;

        // Select previous trades
        var totalAmount = 0;
        var thisUser = this.props.user;
        var thisTrade = this.props.trade;
        var count = this.props.count;
        var trades = _.filter(this.props.tradeList, function(trade, i) {
            return (
                thisUser.id != trade.owner &&
                trade.status != "pending" &&
                trade.status != "new" &&
                ((trade.type == "buys" && thisTrade.price <= trade.price) ||
                 (trade.type == "sells" && thisTrade.price >= trade.price)) &&
                i <= count
            );
        });

        if (!trades.length)
            return;

        totalAmount = _.reduce(_.pluck(trades, 'amount'), function(sum, num) {
            return parseFloat(sum) + parseFloat(num);
        });
        totalValue = _.reduce(_.pluck(trades, 'total'), function(sum, num) {
            return parseFloat(sum) + parseFloat(num);
        });

        if (!totalAmount || !totalValue)
            return;

        var payload = {
            type: (this.props.trade.type == "buys" ? 1 : 2),
            price: this.props.trade.price,
            amount: totalAmount,
            total: totalValue,
            market: this.props.trade.market,
            user: this.props.user
        };

        _.forEach(this.props.tradeList, function(trade) {
            if (!_.find(trades, {'id': trade.id}) && trade.status == "filling")
                trade.status = "mined";
            else if (_.find(trades, {'id': trade.id}) && trade.status == "mined")
                trade.status = "filling";
        });

        payload.fills = trades.length;

        this.setState({
            payload: payload
        });
    },

    handleHoverOut: function(e) {
        if (!this.props.trades)
            return;

        var payload = {
            type: this.props.trades.type,
            price: this.props.trades.price,
            amount: this.props.trades.amount,
            total: this.props.trades.total,
            market: this.props.trade.market,
            user: this.props.user
        };

        this.getFlux().actions.trade.highlightFilling(payload);
    },

    handleClick: function(e) {
        if (this.state.payload)
            this.getFlux().actions.trade.clickFill(this.state.payload);
    }
});

var TradeTable = React.createClass({
    render: function() {
        var tradeListNodes = this.props.tradeList.map(function (trade, i) {
            return (
                <TradeRow key={trade.id} count={i} trade={trade} trades={this.props.trades} tradeList={this.props.tradeList} market={this.props.market} user={this.props.user} review={this.props.review} />
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
                            {!this.props.review &&
                            <th className="text-center trade-op"></th>}
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

module.exports = TradeTable;
