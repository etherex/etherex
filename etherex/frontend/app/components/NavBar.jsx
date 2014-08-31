/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Router = require("react-router");
var Link = Router.Link;

var Tab = require("./Tab");
var UserLink = require("./UserLink");

var NavBar = React.createClass({
    mixins: [FluxChildMixin, StoreWatchMixin("UserStore")], // "TradeStore", "ContactStore")],

    getStateFromFlux: function() {
        var flux = this.getFlux();
        return {
            user: flux.store("UserStore").getState(),
            // market: flux.store("MarketStore").getState(),
            // trades: flux.store("TradeStore").getState(),
            // contacts: flux.store("ContactStore").getState()
        };
    },

    render: function() {
        return (
            <nav className="navbar navbar-default" role="navigation">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-chart-line"></span>
                            <span className="icon-wallet"></span>
                            <span className="icon-contacts"></span>
                            <span className="icon-cog-alt"></span>
                            <span className="icon-help"></span>
                        </button>
                        <Link className="navbar-brand" to="trades">EtherEx</Link>
                    </div>

                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <Tab to="trades" className="icon-chart-line">Trades</Tab>
                            <Tab to="wallet" className="icon-wallet">Wallet</Tab>
                            <Tab to="contacts" className="icon-contacts">Contacts</Tab>
                            <Tab to="settings" className="icon-cog-alt">Settings</Tab>
                            <Tab to="help" className="icon-help">Help</Tab>
                        </ul>
                        <form className="navbar-form navbar-right" role="search" onSubmit={this.onSubmitForm}>
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder="Contact or Trade ID" ref="searchId" />
                            </div>
                            <button type="submit" className="btn btn-default"><span className="glyphicon glyphicon-search"></span></button>
                        </form>
                        <ul className="nav navbar-nav navbar-right">
                            <li><UserLink id={this.props.user.id} showIcon={true} /></li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    },

    onSubmitForm: function(e) {
        e.preventDefault();
        var searchId = this.refs.searchId.getDOMNode().value.trim();
        if (this.state.trades.tradeById[searchId] !== undefined) {
            Router.transitionTo('tradeDetails', {tradeId: searchId});
        } else if (this.state.contacts.contactById[searchId]) {
            Router.transitionTo('contactDetails', {contactId: searchId});
        } else {
            Router.transitionTo('notfound');
        }
    }
});

module.exports = NavBar;
