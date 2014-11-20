/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var NewContactForm = require("./NewContactForm");
var ContactList = require("./ContactList");

var Contacts = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    return (
      <div>
        <NewContactForm />
        <h3>Your Contacts {this.props.contacts.loading && <i className="fa fa-spinner fa-spin"></i>}</h3>
        {this.props.contacts.error && <div className="alert alert-danger" role="alert"><strong>Error!</strong> {this.props.contacts.error}</div>}
        <ContactList contactList={this.props.contacts.contactList} />
      </div>
    );
  }

});

module.exports = Contacts;
