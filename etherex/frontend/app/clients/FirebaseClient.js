var Firebase = require("Firebase");

var FirebaseClient = function(firebaseRef) {

    this.ref = function() {
        return _firebaseRef;
    };

    this.load = function(success, failure) {
        _firebaseRef.child('contacts').once('value', function(dataSnapshot) {
            success(dataSnapshot.val());
        }, failure);
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

    this.set = function(contact, success, failure) {
        _firebaseRef.child('contacts/' + contact.id)
                    .set(contact, this._onComplete(contact, success, failure));
    };

    this.remove = function(contact, success, failure) {
        _firebaseRef.child('contacts/' + contact.id)
                    .remove(this._onComplete(contact, success, failure));
    };

    if (firebaseRef instanceof Firebase === false) {
        throw new Error("firebaseRef must be an instance of Firebase");
    }

    var _firebaseRef = firebaseRef;
};

module.exports = FirebaseClient;
