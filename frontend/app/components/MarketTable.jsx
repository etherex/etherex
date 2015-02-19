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

var MarketRow = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return (
            <tr className={"market-" + this.props.market.status ? this.props.market.status : "default"} onClick={this.handleClick}>
                <td>
                    <div className="text-right">
                        {this.props.market.name}/ETH
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        <span className={this.props.market.dayClass}>{this.props.market.daySign}</span>
                            {this.props.market.dayChange} /{' '}
                        <span className={this.props.market.weekClass}>{this.props.market.weekSign}</span>
                            {this.props.market.weekChange} /{' '}
                        <span className={this.props.market.monthClass}>{this.props.market.monthSign}</span>
                            {this.props.market.monthChange}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.market.lastPrice, 4)}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.format(this.props.market.available)} available / {utils.format(this.props.market.trading)} in trades / {utils.format(this.props.market.balance)} in your wallet
                    </div>
                </td>
            </tr>
        );
    },

    handleClick: function(e) {
        if (this.props.market)
            this.getFlux().actions.market.switchMarket(this.props.market);
    }
});

var MarketTable = React.createClass({
    render: function() {
        var marketListNodes = this.props.market.markets.map(function (market) {
            return (
                <MarketRow key={market.id} market={market} /> //user={this.props.user} review={this.props.review} />
            );
        }.bind(this));
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-right">Currency pair</th>
                            <th className="text-center">% change in<br />24h/1w/1m</th>
                            <th className="text-right">Last Price</th>
                            <th className="text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketListNodes}
                    </tbody>
                </Table>
            </div>
        );
    }
});

module.exports = MarketTable;
