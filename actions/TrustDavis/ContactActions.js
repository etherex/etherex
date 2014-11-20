var constants = require("../constants");

var ContactActions = function(client) {

    this.loadContacts = function() {
        this.dispatch(constants.contact.LOAD_CONTACTS);

        _client.loadContacts(function(contacts) {
            this.dispatch(constants.contact.LOAD_CONTACTS_SUCCESS, contacts);
        }.bind(this), function(error) {
            console.log(error);
            this.dispatch(constants.contact.LOAD_CONTACTS_FAIL, {error: error});
        }.bind(this));
    };

    this.addContact = function(contact) {
        _client.setContact(contact, function() {
            this.dispatch(constants.contact.ADD_CONTACT, contact);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    this.removeContact = function(contact) {
        _client.removeContact(contact, function() {
            this.dispatch(constants.contact.REMOVE_CONTACT, contact);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    this.renameContact = function(contact) {
        _client.setContact(contact, function() {
            this.dispatch(constants.contact.RENAME_CONTACT, contact);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    var _client = client;
};

module.exports = ContactActions;
