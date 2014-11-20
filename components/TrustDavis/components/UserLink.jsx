/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var Router = require("react-router");
var Link = Router.Link;

var UserLink = React.createClass({
    mixins: [FluxChildMixin],

    propTypes: {
        id: React.PropTypes.string,
        users: React.PropTypes.object.isRequired
    },

    shortIdLength: 8,

    render: function() {
        if (!this.props.id) {
            return null;
        }
        var shortId = this.props.id.substr(0, this.shortIdLength);
        var user = this.props.users.users[this.props.id];

        return (
            <Link to="userDetails" userId={this.props.id}>
                {this.props.showIcon && <span className="glyphicon glyphicon-user"></span>} {user && user.name} ({shortId + '\u2026'})
            </Link>
        );
    }
});

module.exports = UserLink;
