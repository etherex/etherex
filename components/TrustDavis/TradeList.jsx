/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");
var Link = Router.Link;

var UserLink = require("./UserLink");

var TradeRow = React.createClass({
    render: function() {
        var isBuyer = this.props.trade.buyerId && (this.props.trade.buyerId === this.props.users.currentUser.id);
        var isSeller = this.props.trade.sellerId && (this.props.trade.sellerId === this.props.users.currentUser.id);
        var counterpartyId;

        if (isBuyer) {
            counterpartyId = this.props.trade.sellerId;
        } else if (isSeller) {
            counterpartyId = this.props.trade.buyerId;
        }

        return (
            <tr>
                <td>{this.props.trade.type}</td>
                <td>{this.props.trade.category}</td>
                <td><Link to="tradeDetails" tradeId={this.props.trade.id}>
                {this.props.trade.description}</Link></td>
                <td>{this.props.trade.price} ETH</td>
                <td>{counterpartyId ? <UserLink id={counterpartyId} /> : 'Not claimed'}</td>
                <td>{this.props.trade.status}</td>
                <td>{this.props.trade.expiration}</td>
            </tr>
        );
    }
});

var TradeTable = React.createClass({
    render: function() {
        var tradeListNodes = this.props.tradeList.map(function(trade) {
            return (
                <TradeRow key={trade.id} trade={trade} users={this.props.users} />
            );
        }.bind(this));
        return (
            <table className="tradeList table table-striped">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Counterparty</th>
                        <th>Status</th>
                        <th>Expiration</th>
                    </tr>
                </thead>
                <tbody>
                    {tradeListNodes}
                </tbody>
            </table>
        );
    }
});

var TradeList = React.createClass({
    render: function() {
        return (
            <div>
                <h3>{this.props.title} {this.props.trades.loading && <i className="fa fa-spinner fa-spin"></i>}</h3>
                {this.props.trades.error && <div className="alert alert-danger" role="alert"><strong>Error!</strong> {this.props.trades.error}</div>}
                <TradeTable tradeList={this.props.trades.tradeList} users={this.props.users} />
            </div>
        );
    }
});

module.exports = TradeList;
