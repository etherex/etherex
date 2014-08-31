/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");
// var Link = Router.Link;

// var UserLink = require("./UserLink");

var TradeRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td>{this.props.trade.type}</td>
                <td>{this.props.trade.amount} {' '} {this.props.trade.market.name}</td>
                <td>{this.props.trade.price} {' '} {this.props.trade.market.name}/ETH</td>
                <td>{(this.props.trade.amount / this.props.trade.price).toFixed(8)} ETH</td>
                <td>{this.props.trade.market.name}</td>
                <td>{this.props.trade.owner}</td>
            </tr>
        );
    }
});

var TradeList = React.createClass({
    render: function() {
        var tradeListNodes = this.props.tradeList.map(function (trade, user) {
            return (
                <TradeRow key={trade.id} trade={trade} user={user} />
            );
        }.bind(this));
        return (
            <table className="tradeList table table-striped">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Market</th>
                        <th>By</th>
                    </tr>
                </thead>
                <tbody>
                    {tradeListNodes}
                </tbody>
            </table>
        );
    }
});

module.exports = TradeList;
