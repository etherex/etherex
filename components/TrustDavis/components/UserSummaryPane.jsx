/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var ModalTrigger = require('react-bootstrap/ModalTrigger');

var UserIdModal = require("./UserIdModal");

var UserSummaryPane = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        var isContact = this.props.contacts.contactById.hasOwnProperty(this.props.user.id);
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">User Summary: {this.props.user.name}</h3>
                </div>
                <div className="panel-body">
                    <table className="table table-condensed table-striped">
                        <tbody>
                            <tr>
                                <td>User ID</td>
                                <td>{this.props.user.id + '\u2026 '}
                                    <ModalTrigger modal={<UserIdModal user={this.props.user} />}>
                                        <button type="button" className="btn btn-default btn-xs">
                                            <i className="fa fa-files-o fa-lg"></i>
                                        </button>
                                    </ModalTrigger>
                                </td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>{this.props.user.name}{' '}
                                {!isContact &&
                                    <button type="button" className="btn btn-default"
                                        onClick={this.onAddToContacts}>Add to Contacts</button>
                                }
                                </td>
                            </tr>
                            <tr>
                                <td>Trades</td>
                                <td>{this.props.tradeList.length}</td>
                            </tr>
                            <tr>
                                <td>References</td>
                                <td>{this.props.referencesList.length}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    },

    onAddToContacts: function() {
        this.getFlux().actions.contact.addContact({id: this.props.user.id});
    }
});

module.exports = UserSummaryPane;
