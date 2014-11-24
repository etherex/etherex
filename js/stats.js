var _ = require('lodash');

var stats = {
    // XXX should this be part of the ReferenceStore?
    sumReferenceStats: function(references) {
        var maxLiabilities = _.reduce(references, function(s, entry) {
            return s + parseFloat(entry.maxLiability);
        }, 0);
        var lockedLiabilities = _.reduce(references, function(s, entry) {
            return s + parseFloat(entry.lockedLiability);
        }, 0);

        return {
            maxLiabilities: maxLiabilities,
            lockedLiabilities: lockedLiabilities
        };
    }
};

module.exports = stats;
