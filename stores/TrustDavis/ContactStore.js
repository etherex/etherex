var Fluxxor = require("fluxxor");
var _ = require("lodash");

var constants = require("../constants");

var ContactStore = Fluxxor.createStore({
    initialize: function(options) {
        this.contacts = options.contacts || {};
        this.loading = false;
        this.error = null;

        this.bindActions(
            constants.contact.LOAD_CONTACTS, this.onLoadContacts,
            constants.contact.LOAD_CONTACTS_SUCCESS, this.onLoadContactsSuccess,
            constants.contact.LOAD_CONTACTS_FAIL, this.onLoadContactsFail,
            constants.contact.ADD_CONTACT, this.onAddContact,
            constants.contact.REMOVE_CONTACT, this.onRemoveContact,
            constants.contact.RENAME_CONTACT, this.onRenameContact
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadContacts: function() {
        this.contacts = {};
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadContactsSuccess: function(payload) {
        this.contacts = payload;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadContactsFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onAddContact: function(payload) {
        this.contacts[payload.id] = {
            id: payload.id,
            name: payload.name
        };
        this.emit(constants.CHANGE_EVENT);
    },

    onRemoveContact: function(payload) {
        delete this.contacts[payload.id];
        this.emit(constants.CHANGE_EVENT);
    },

    onRenameContact: function(payload) {
        this.contacts[payload.id].name = payload.name;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            contactList: _.values(this.contacts),
            contactById: this.contacts,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = ContactStore;
