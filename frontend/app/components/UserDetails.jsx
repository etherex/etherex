var _ = require('lodash');
var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React);

var UserSummaryPane = require("./UserSummaryPane");
var TradeList = require("./TradeList");

var UserDetails = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        var own = {tradeBuys: [], tradeSells: []};
        if (this.props.user && this.props.trades && (this.props.trades.tradeBuys.length > 0) || (this.props.trades.tradeSells.length > 0)) {
            own.tradeBuys = _.filter(this.props.trades.tradeBuys, {'owner': this.props.user.user.id});
            own.tradeSells = _.filter(this.props.trades.tradeSells, {'owner': this.props.user.user.id});
            own.title = "Your trades"; // this.props.user.user.id.substr(0,8) + "\u2026 " + "'s trades";
            this.props.user.user.own = true;
        }

        if (this.props.user.user.id) {
            return (
                <div>
                    <UserSummaryPane user={this.props.user} trades={own} />
                    {(own.tradeBuys && own.tradeSells) &&
                        <TradeList market={this.props.market} trades={own} user={this.props.user} />}
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
