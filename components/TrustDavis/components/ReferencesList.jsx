/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var UserLink = require("./UserLink");
var ActionDropDown = require("./ActionDropDown");

var constants = require("../constants");

var ReferenceRow = React.createClass({
    mixins: [FluxChildMixin],
    render: function() {
        return (
            <tr>
                <td><UserLink users={this.props.users} id={this.props.reference.id} /></td>
                <td>{constants.CURRENCY} {this.props.reference.maxLiability}</td>
                <td>{this.props.reference.premiumPct} %</td>
                <td>{constants.CURRENCY} {this.props.reference.lockedLiability}</td>
                {this.props.editable && <td><ActionDropDown key={this.props.reference.id} handleDelete={this.handleDelete} /></td>}
            </tr>
        );
    },
    handleDelete: function(e) {
        e.preventDefault();
        this.getFlux().actions.reference.removeReference(this.props.reference);
    }
});

var ReferencesTable = React.createClass({
    render: function() {
        var referencesListNodes = this.props.referencesList.map(function(reference) {
            return (
                <ReferenceRow key={reference.id} users={this.props.users} reference={reference} editable={this.props.editable} />
            );
        }.bind(this));

        return (
            <table className="referenceList table table-striped">
                <thead>
                    <tr>
                        <th>Trader</th>
                        <th>Max Liability</th>
                        <th>Premium</th>
                        <th>Locked Liability</th>
                        {this.props.editable && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {referencesListNodes}
                </tbody>
            </table>
        );
    }
});

var ReferencesList = React.createClass({
    render: function() {
        return (
            <div>
                <h3>{this.props.title} {this.props.references.loading && <i className="fa fa-spinner fa-spin"></i>}</h3>
                {this.props.references.error && <div className="alert alert-danger" role="alert"><strong>Error!</strong> {this.props.references.error}</div>}
                <ReferencesTable users={this.props.users} referencesList={this.props.references.referencesList} editable={this.props.editable} />
            </div>
        );
    }
});

module.exports = ReferencesList;
