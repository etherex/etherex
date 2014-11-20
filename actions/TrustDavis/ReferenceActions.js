var constants = require("../constants");

var ReferenceActions = function(client) {

    this.loadReferences = function() {
        this.dispatch(constants.reference.LOAD_REFERENCES);

        _client.loadReferences(function(references) {
            this.dispatch(constants.reference.LOAD_REFERENCES_SUCCESS, references);
        }.bind(this), function(error) {
            console.log(error);
            this.dispatch(constants.reference.LOAD_REFERENCES_FAIL, {error: error});
        }.bind(this));
    };

    this.addReference = function(reference) {
        _client.setReference(reference, function() {
            this.dispatch(constants.reference.ADD_REFERENCE, reference);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    this.removeReference = function(reference) {
        _client.removeReference(reference, function() {
            this.dispatch(constants.reference.REMOVE_REFERENCE, reference);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    var _client = client;
};

module.exports = ReferenceActions;
