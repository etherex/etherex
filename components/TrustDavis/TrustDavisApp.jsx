/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var NavBar = require("./NavBar");
var CreateAccountModal = require("./CreateAccountModal");

var TrustDavisApp = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("TradeStore", "ReferenceStore", "ContactStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
        trades: flux.store("TradeStore").getState(),
        references: flux.store("ReferenceStore").getState(),
        contacts: flux.store("ContactStore").getState(),
        users: flux.store("UserStore").getState()
    };
  },

  render: function() {
    return (
      <div>
        <NavBar trades={this.state.trades} contacts={this.state.contacts} users={this.state.users} />
        {this.state.users.createAccount && <CreateAccountModal flux={this.getFlux()} />}
        <this.props.activeRouteHandler trades={this.state.trades} references={this.state.references} contacts={this.state.contacts} users={this.state.users} />
      </div>
    );
  },

  componentDidMount: function() {
    this.getFlux().actions.user.loadUsers();
    this.getFlux().actions.contact.loadContacts();
    this.getFlux().actions.trade.loadTrades();
    this.getFlux().actions.reference.loadReferences();
  },
});

module.exports = TrustDavisApp;
