/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var Alert = require('react-bootstrap/Alert');

var constants = require("../constants");

var NewContactForm = React.createClass({
    mixins: [FluxChildMixin],

    getInitialState: function() {
        return {
            userName: '',
            userNotFound: false
        };
    },

    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">New Contact</h3>
                </div>
                <div className="panel-body">
                    {this.state.userNotFound && <Alert bsStyle="warning">
                        <strong>Can't add contact!</strong> There is no such user known with the name "{this.state.userName}".
                    </Alert>}
                    <form className="form-inline" onSubmit={this.onSubmitForm}>
                        I want to add the contact{' '}
                        <input type="text" className="form-control" pattern={constants.VALID_USERNAME_PATTERN} placeholder="name" value={this.state.userName} onChange={this.onNameChange} />
                        {' '}
                        <button type="submit" className="btn btn-default">Add</button>
                    </form>
                </div>
            </div>
        );
    },

    onNameChange: function(e) {
        this.setState({userName: e.target.value.trim().toLowerCase(), userNotFound: false});
    },

    onSubmitForm: function(e) {
        e.preventDefault();
        var name = this.state.userName.trim().toLowerCase();

        if (!name) {
            return false;
        }

        var contactId = this.props.users.usersByName[name];
        if (contactId) {
            this.getFlux().actions.contact.addContact({id: contactId});
            this.setState({userName: '', userNotFound: false});
        } else {
            console.log("User " + name + " not found");
            this.setState({userName: name, userNotFound: true});
        }
        return false;
    }
});

module.exports = NewContactForm;
