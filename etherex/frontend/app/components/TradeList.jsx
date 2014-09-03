/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmTradeModal = require('./ConfirmTradeModal');

var Table = require("react-bootstrap/Table");
var Button = require("react-bootstrap/Button");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TradeRow = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <tr>
                <td>{this.props.trade.type}</td>
                <td>{this.props.trade.amount.toLocaleString()} {' '} {this.props.trade.market.name}</td>
                <td>{this.props.trade.price.toLocaleString()} {' '} {this.props.trade.market.name}/ETH</td>
                <td>{(this.props.trade.amount / this.props.trade.price).toLocaleString()} ETH</td>
                <td>{this.props.trade.market.name}</td>
                <td><div className="ellipsis">{this.props.trade.owner}</div></td>
                <td>{(this.props.trade.owner == this.props.user.id) ?
                    <ModalTrigger modal={
                            <ConfirmTradeModal
                                type="cancel"
                                message="Are you sure you want to cancel this trade?"
                                trade={this.props.trade}
                                flux={this.getFlux()}
                            />
                        }>
                        <Button key="cancel">Cancel</Button>
                    </ModalTrigger> :
                    <ModalTrigger modal={
                            <ConfirmTradeModal
                                type="fill"
                                message={
                                    "Are you sure you want to " + (this.props.trade.type == "buy" ? "sell" : "buy") +
                                    " " + this.props.trade.amount + " " + this.props.trade.market.name +
                                    " at " + this.props.trade.price + " " + this.props.trade.market.name + "/ETH" +
                                    " for " + (this.props.trade.amount / this.props.trade.price) + " ETH"
                                }
                                trade={this.props.trade}
                                flux={this.getFlux()}
                            />
                        }>
                        <Button key="fill">Fill</Button>
                    </ModalTrigger>}
                </td>
            </tr>
        );
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
            <Table responsive striped>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Market</th>
                        <th>By</th>
                        <th>Op</th>
                    </tr>
                </thead>
                <tbody>
                    {tradeListNodes}
                </tbody>
            </Table>
        );
    }
});

var TradeList = React.createClass({
    render: function() {
        return (
            <div>
                <h3>{this.props.title} {this.props.trades.loading && <i className="fa fa-spinner fa-spin"></i>}</h3>
                {this.props.trades.error && <div className="alert alert-danger" role="alert"><strong>Error!</strong> {this.props.trades.error}</div>}
                <TradeTable tradeList={this.props.trades.tradeList} user={this.props.user.user} />
            </div>
        );
    }
});

module.exports = TradeList;
