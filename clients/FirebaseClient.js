var Firebase = require("Firebase");

var utils = require("../utils");

var FirebaseClient = function(firebaseRef) {

    this.loadTrades = function(success, failure) {
        _firebaseRef.child('trade').once('value', function(data) {
            var trades = data.val() || {};
            success(trades);
        }, failure);
    };

    this.setTrade = function(trade, success, failure) {
        _firebaseRef.child('trade').child(trade.id)
                    .set(trade, this._onComplete(trade, success, failure));
    };

    this.loadReferences = function(success, failure) {
        var uid = this._UID();
        _firebaseRef.child('reference').child(uid).once('value', function(data) {
            var references = data.val() || {};
            success(references);
        }, failure);
    };

    this.setReference = function(reference, success, failure) {
        var uid = this._UID();
        _firebaseRef.child('reference').child(uid).child(reference.id)
                    .set(reference, this._onComplete(reference, success, failure));
    };

    this.removeReference = function(reference, success, failure) {
        var uid = this._UID();
        _firebaseRef.child('reference').child(uid).child(reference.id)
                    .remove(this._onComplete(reference, success, failure));
    };

    this.loadContacts = function(success, failure) {
        var uid = this._UID();
        _firebaseRef.child('contact').child(uid).once('value', function(data) {
            var contacts = data.val() || {};
            success(contacts);
        }, failure);
    };

    this.setContact = function(contact, success, failure) {
        var uid = this._UID();
        _firebaseRef.child('contact').child(uid).child(contact.id)
                    .set(contact, this._onComplete(contact, success, failure));
    };

    this.removeContact = function(contact, success, failure) {
        var uid = this._UID();
        _firebaseRef.child('contact').child(uid).child(contact.id)
                    .remove(this._onComplete(contact, success, failure));
    };

    this._UID = function() {
        /* global localStorage */
        var uid = localStorage.getItem('uid');
        if (!uid) {
            uid = utils.randomId();
            localStorage.setItem('uid', uid);
        }
        return(uid);
    };

    this.loadUser = function(success, failure) {
        var uid = this._UID();
        _firebaseRef.child('user').child(uid).once('value', function(data) {
            var user = data.val() || {id: uid};
            success(user);
        }, failure);
    };

    this.setUserName = function(name, success, failure) {
        var uid = this._UID();
        var user = {id: uid, name: name};
        _firebaseRef.child('user').child(uid)
                    .update(user, this._onComplete(name, success, failure));
    };

    this.ref = function() {
        return _firebaseRef;
    };

    this._onComplete = function(item, success, failure) {
        return function(error) {
            if (error) {
                failure(error);
            } else {
                success(item);
            }
        };
    };

    if (firebaseRef instanceof Firebase === false) {
        throw new Error("firebaseRef must be an instance of Firebase");
    }

    var _firebaseRef = firebaseRef;
};

module.exports = FirebaseClient;
