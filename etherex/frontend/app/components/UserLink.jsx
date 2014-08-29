/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Router = require("react-router");
var Link = Router.Link;

var UserLink = React.createClass({
    // mixins: [FluxChildMixin, StoreWatchMixin("ContactStore", "UserStore")],
    mixins: [FluxChildMixin, StoreWatchMixin("UserStore")],

    propTypes: {
        id: React.PropTypes.string.isRequired
    },

    shortIdLength: 8,

    getStateFromFlux: function() {
        var flux = this.getFlux();
        return {
            // contacts: flux.store("ContactStore").getState(),
            user: flux.store("UserStore").getState()
        };
    },

    render: function() {
        var shortId = this.props.id.substr(0, this.shortIdLength);
        var userName;

        if (this.props.id === this.state.user.user.id) {
            userName = this.state.user.user.name;
        } else {
            // var contact = this.state.contacts.contactById[this.props.id];
            // if (contact) {
            //     userName = contact.name;
            // } else {
            //     userName = "[unknown]";
            // }
        }
        return (
            <Link to="contactDetails" contactId={this.props.id}>
                {this.props.showIcon && <span className="glyphicon glyphicon-user"></span>} {userName} ({shortId + '\u2026'})
            </Link>
        );
    }
});

module.exports = UserLink;
