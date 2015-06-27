/** @jsx React.DOM */

var React = require("react");

var Router = require("react-router");
var Link = Router.Link;

var UserLink = React.createClass({

    propTypes: {
        id: React.PropTypes.string.isRequired
    },

    shortIdLength: 8,

    render: function() {
        if (!this.props.id) {
            return null;
        }
        var shortId = this.props.id.substr(0, this.shortIdLength);
        // userId={this.props.id}>
        return (
            <Link to="userDetails">
                {this.props.showIcon && <span className="glyphicon glyphicon-user"></span>} {shortId + '\u2026'}
            </Link>
        );
    }
});

module.exports = UserLink;
