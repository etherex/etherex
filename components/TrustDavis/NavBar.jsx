/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var Router = require("react-router");
var Link = Router.Link;

var Tab = require("./Tab");
var UserLink = require("./UserLink");

var NavBar = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <nav className="navbar navbar-inverse" role="navigation">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <Link className="navbar-brand" to="trades">TrustDavis</Link>
                    </div>

                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <Tab to="trades">Trades</Tab>
                            <Tab to="references">References</Tab>
                            <Tab to="contacts">Contacts</Tab>
                        </ul>
                        <form className="navbar-form navbar-right" role="search" onSubmit={this.onSubmitForm}>
                            <div className="form-group">
                                <input type="text" className="form-control" pattern="[0-9a-fA-F]{64}" placeholder="User or Trade ID" ref="searchId" />
                            </div>
                            <button type="submit" className="btn btn-default"><span className="glyphicon glyphicon-search"></span></button>
                        </form>
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                {this.props.users.loading ? <p className="navbar-text"><i className="fa fa-spinner fa-spin"></i></p>
                                    : <UserLink users={this.props.users} id={this.props.users.currentUserId} showIcon={true} />}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    },

    onSubmitForm: function(e) {
        e.preventDefault();
        var searchId = this.refs.searchId.getDOMNode().value.trim();
        if (this.props.trades.tradeById[searchId] !== undefined) {
            Router.transitionTo('tradeDetails', {tradeId: searchId});
        } else if (this.props.contacts.contactById[searchId]) {
            Router.transitionTo('userDetails', {userId: searchId});
        } else {
            Router.transitionTo('notfound');
        }
    }
});

module.exports = NavBar;
