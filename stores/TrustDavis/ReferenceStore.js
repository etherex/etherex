var Fluxxor = require("fluxxor");

var _ = require('lodash');

var constants = require("../constants");

var ReferenceStore = Fluxxor.createStore({

    initialize: function(options) {
        this.references = options.references || {};
        this.loading = false;
        this.error = null;

        this.bindActions(
            constants.reference.LOAD_REFERENCES, this.onLoadReferences,
            constants.reference.LOAD_REFERENCES_SUCCESS, this.onLoadReferencesSuccess,
            constants.reference.LOAD_REFERENCES_FAIL, this.onLoadReferencesFail,
            constants.reference.ADD_REFERENCE, this.onAddReference,
            constants.reference.REMOVE_REFERENCE, this.onRemoveReference
        );
    },

    onLoadReferences: function() {
        this.references = {};
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadReferencesSuccess: function(payload) {
        this.references = payload;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadReferencesFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onAddReference: function(payload) {
        this.references[payload.id] = {
            id: payload.id,
            trader: payload.trader,
            maxLiability: payload.maxLiability,
            premiumPct: payload.premiumPct,
            lockedLiability: 0
        };
        this.emit(constants.CHANGE_EVENT);
    },

    onRemoveReference: function(payload) {
        delete this.references[payload.id];
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            referencesList: _.values(this.references),
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = ReferenceStore;
