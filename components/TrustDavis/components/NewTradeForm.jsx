/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var Router = require("react-router");
var moment = require("moment");

var constants = require("../constants");
var utils = require("../utils");

var NewTradeForm = React.createClass({
    mixins: [FluxChildMixin],

    getInitialState: function() {
        return {
            type: 'sell',
            description: '',
            price: '',
            validUntil: moment().add(constants.TRADE_VALID_DAYS, 'days').endOf('day').format("YYYY-MM-DD")
        };
    },

    render: function() {
        var enableButton = this.state.description && this.state.price;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">New Trade</h3>
                </div>
                <div className="panel-body">
                    <form className="form-inline" onSubmit={this.onSubmitForm}>
                        I want to <strong>{this.state.type}</strong>
                        {' '}
                        <input type="text" className="form-control" pattern=".{0,32}" placeholder="description" onChange={this.onChangeDescription} />
                        {' '}
                        for {constants.CURRENCY}
                        {' '}
                        <input type="number" min="0" step="0.01" className="form-control small" placeholder="0.00" onChange={this.onChangePrice} />
                        <p>This offer is <strong>valid for {constants.TRADE_VALID_DAYS} days</strong> (until {this.state.validUntil})
                            {' '}
                            <button type="submit" className="btn btn-default" disabled={!enableButton}>Create</button>
                        </p>
                    </form>
                </div>
            </div>
        );
    },

    onChangeDescription: function(e) {
        this.setState({description: e.target.value});
    },

    onChangePrice: function(e) {
        this.setState({price: e.target.value});
    },

    onSubmitForm: function(e) {
        e.preventDefault();

        if (!this.state.type || !this.state.description || !this.state.price) {
            return false;
        }

        var trade = {
            id: utils.randomId(),
            type: this.state.type,
            description: this.state.description,
            price: this.state.price,
            expiration: this.state.validUntil
        };

        if (trade.type === 'sell') {
            trade.sellerId = this.props.users.currentUserId;
        } else if (trade.type === 'buy') {
            trade.buyerId = this.props.users.currentUserId;
        }

        this.getFlux().actions.trade.addTrade(trade);

        this.setState({description: '', price: ''});
        Router.transitionTo('tradeDetails', {tradeId: trade.id});
        return false;
    }
});

module.exports = NewTradeForm;
