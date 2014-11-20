/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var UserSummaryPane = require("./UserSummaryPane");
var TradeList = require("./TradeList");
var ReferencesList = require("./ReferencesList");

var UserDetails = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        if (this.props.users.loading) {
            return (
                <h3>Loading <i className="fa fa-spinner fa-spin"></i></h3>
            );
        }
        var user = this.props.users.users[this.props.params.userId];
        if (user) {
            return (
                <div>
                    <UserSummaryPane user={user} tradeList={this.props.trades.tradeList} referencesList={this.props.references.referencesList} />
                    <TradeList title={user.name + "'s Active Trades"} trades={this.props.trades} user={this.props.users.currentUser} />
                    <ReferencesList title={user.name + "'s References"} references={this.props.references} />
                </div>
            );
        } else {
            return (
                <h3>User not found</h3>
            );
        }
    }
});

module.exports = UserDetails;
