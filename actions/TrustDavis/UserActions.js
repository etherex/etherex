var constants = require("../constants");

var UserActions = function(client) {

    this.loadUsers = function() {
        this.dispatch(constants.user.LOAD_USERS, {currentUserId: _client.UID()});

        _client.loadUsers(function(users) {
            this.dispatch(constants.user.LOAD_USERS_SUCCESS, {users: users});
        }.bind(this), function(error) {
            console.log(error);
            this.dispatch(constants.user.LOAD_USERS_FAIL, {error: error});
        }.bind(this));
    };

    this.registerUser = function(name) {
        _client.setUserName(name, function(name) {
          this.dispatch(constants.user.REGISTER_USER, {name: name});
        }.bind(this), function(error) {
          console.log(error);
        }.bind(this));
    };

    this.deposit = function(amount) {
        this.dispatch(constants.user.DEPOSIT, {amount: amount});
    };

    this.withdraw = function(amount) {
        this.dispatch(constants.user.WITHDRAW, {amount: amount});
    };

    var _client = client;
};

module.exports = UserActions;
