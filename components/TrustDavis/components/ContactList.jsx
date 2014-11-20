/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var _ = require('lodash');

var ActionDropDown = require("./ActionDropDown");
var UserLink = require("./UserLink");

var ContactRow = React.createClass({
    mixins: [FluxChildMixin],
    render: function() {
        return (
            <tr>
                <td><UserLink users={this.props.users} id={this.props.contactId} /></td>
                <td><ActionDropDown key={this.props.contactId}
                        handleDelete={this.handleDelete} /></td>
            </tr>
        );
    },
    handleDelete: function(e) {
        e.preventDefault();
        this.getFlux().actions.contact.removeContact(this.props.contactId);
    }
});

var ContactList = React.createClass({
    render: function() {
        var contactListNodes = _.map(this.props.contactList, function(contactId) {
            return (
                <ContactRow key={contactId} contactId={contactId} users={this.props.users} />
            );
        }.bind(this));
        return (
            <table className="contactList table table-striped">
                <thead>
                    <tr>
                        <th>Contact</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {contactListNodes}
                </tbody>
            </table>
        );
    }
});

module.exports = ContactList;
