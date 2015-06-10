/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var Router = require("react-router");
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;

var EtherExApp = require("./components/EtherExApp");

var Placeholder = require("./components/Placeholder");

var ConfigStore = require("./stores/ConfigStore");
var NetworkStore = require("./stores/NetworkStore");
var UserStore = require("./stores/UserStore");
var TradeStore = require("./stores/TradeStore");
var MarketStore = require("./stores/MarketStore");

var ConfigActions = require("./actions/ConfigActions");
var NetworkActions = require("./actions/NetworkActions");
var UserActions = require("./actions/UserActions");
var TradeActions = require("./actions/TradeActions");
var MarketActions = require("./actions/MarketActions");

var Trades = require("./components/Trades");
var Markets = require("./components/Markets");
var UserDetails = require("./components/UserDetails");
// var TradeDetails = require("./components/TradeDetails");
var Wallet = require("./components/Wallet");
var Tools = require("./components/Tools");

// Load bootstrap
require("./css/bootstrap-darkly.css");

require("./css/styles.css");

var Route = Router.Route;
// var Redirect = Router.Redirect;

var stores = {
  config: new ConfigStore(),
  network: new NetworkStore(),
  MarketStore: new MarketStore(),
  TradeStore: new TradeStore(),
  UserStore: new UserStore()
};

var actions = {
  config: new ConfigActions(),
  network: new NetworkActions(),
  market: new MarketActions(),
  trade: new TradeActions(),
  user: new UserActions()
};

var flux = new Fluxxor.Flux(stores, actions);

if (flux.store('config').getState().debug)
  flux.on("dispatch", function(type, payload) {
    console.log("Dispatched", type, payload);
  });

var routes = (
    <Route name="app" handler={EtherExApp} flux={flux}>
      <DefaultRoute handler={Trades} title="Home" />
      <Route name="home" path="/" handler={Trades} title="Trades" />
      <Route name="tradeDetails" path="/trade/:tradeId" handler={Placeholder} flux={flux} title="Trade details" />
      <Route name="markets" path="/markets" handler={Markets} flux={flux} title="Markets" />
      <Route name="subs" path="/markets/subs" handler={Markets} flux={flux} title="Subs" />
      <Route name="xchain" path="/markets/xchain" handler={Markets} flux={flux} title="X-Chain" />
      <Route name="assets" path="/markets/assets" handler={Markets} flux={flux} title="Assets" />
      <Route name="currencies" path="/markets/currencies" handler={Markets} flux={flux} title="Currencies" />
      <Route name="wallet" path="/wallet" handler={Wallet} flux={flux} title="Wallet" />
      <Route name="tools" path="/tools" handler={Tools} flux={flux} title="Tools" />
      <Route name="help" path="/help" handler={Placeholder} flux={flux} title="Help" />
      <Route name="userDetails" path="/user" handler={UserDetails} flux={flux} title="User details" />
      <NotFoundRoute name="notfound" handler={Placeholder} title="User or Trade ID not found" flux={flux} />
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux}/>, document.body);
});
