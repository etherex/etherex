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

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TradeRow = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <tr>
                <td><div className="btn">{this.props.trade.amount.toLocaleString()}</div></td>
                <td><div className="btn">{this.props.trade.market.name}</div></td>
                <td><div className="btn">{this.props.trade.price.toLocaleString()}</div></td>
                <td><div className="btn">{(this.props.trade.amount / this.props.trade.price).toLocaleString()} ETH</div></td>
                <td><div className="btn"><div className="ellipsis">{this.props.trade.owner}</div></div></td>
                <td><div className="pull-right">{
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
                            <Button key="cancel">Cancel</Button>
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
                            <Button key="fill">Fill</Button>
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
                <Table striped condensed hover responsive>
                    <thead>
                        <tr>
                            <th className="text-center">Amount</th>
                            <th className="text-center">Market</th>
                            <th className="text-center">Price</th>
                            <th className="text-center">Total</th>
                            <th className="text-center">By</th>
                            <th className="text-center">Op</th>
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

var TradeList = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <div>
                <h3>{this.props.trades.title} {this.props.trades.loading && <span>loading...</span>}</h3>
                {this.props.trades.loading &&
                    <ProgressBar active now={this.props.trades.percent} />}
                {this.props.trades.error &&
                    <div className="alert alert-danger" role="alert"><strong>Error!</strong> {this.props.trades.error}</div>}
                <div className="col-md-6">
                    <TradeTable title="Buys" tradeList={this.props.trades.tradeBuys} user={this.props.user.user} />
                </div>
                <div className="col-md-6">
                    <TradeTable title="Sells" tradeList={this.props.trades.tradeSells} user={this.props.user.user} />
                </div>
            </div>
        );
    }
});

module.exports = TradeList;
