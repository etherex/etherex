/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var Router = require("react-router");
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

var EtherExApp = require("./components/EtherExApp");

var Placeholder = require("./components/Placeholder");

var Trades = require("./components/Trades");
var TradeStore = require("./stores/TradeStore");
var TradeActions = require("./actions/TradeActions");
// var TradeDetails = require("./components/TradeDetails");

var UserStore = require("./stores/UserStore");
var UserActions = require("./actions/UserActions");
var UserDetails = require("./components/UserDetails");

var Markets = require("./components/Markets");
var MarketStore = require("./stores/MarketStore");
var MarketActions = require("./actions/MarketActions");

var Wallet = require("./components/Wallet");
var Tools = require("./components/Tools");

// TODO mock data
var fixtures = require("./js/fixtures");

var EthereumClient = require("./clients/EthereumClient");
var client = new EthereumClient();

// Load jQuery and bootstrap
var jQuery = require("jquery");
window.$ = window.jQuery = jQuery;

var _ = require('lodash');
window._ = _;

require("bootstrap/dist/js/bootstrap.js");
// require("bootstrap/dist/css/bootstrap.min.css");
// require("bootstrap/dist/css/bootstrap-theme.min.css");
require("./css/bootstrap-darkly.css");

// require("./css/rickshaw.min.css");
require("./css/styles.css");

var Route = Router.Route;
var Redirect = Router.Redirect;

var stores = {
  MarketStore: new MarketStore(),
  TradeStore: new TradeStore(),
  UserStore: new UserStore()
};

var actions = {
  market: new MarketActions(client),
  trade: new TradeActions(client),
  user: new UserActions(client)
};

var flux = new Fluxxor.Flux(stores, actions);

// DEBUG
// flux.on("dispatch", function(type, payload) {
//   if (console && console.log) {
//     console.log("[Dispatch]", type, payload);
//   }
// });

var routes = (
    <Route name="app" handler={EtherExApp} flux={flux}>
      <DefaultRoute handler={Trades} flux={flux} title="Trades" />
      <Route name="home" path="/" handler={Trades} flux={flux} title="Trades" />
      <Route name="trades" path="/trades" handler={Trades} flux={flux} title="Trades" />
      <Route name="trades/xchain" path="/trades/xchain" handler={Trades} flux={flux} title="X-Chain" />
      <Route name="trades/assets" path="/trades/assets" handler={Trades} flux={flux} title="Assets" />
      <Route name="trades/currencies" path="/trades/currencies" handler={Trades} flux={flux} title="Currencies" />
      <Route name="tradeDetails" path="/trade/:tradeId" handler={Placeholder} flux={flux} title="Trade details" />
      <Route name="markets" path="/markets" handler={Markets} flux={flux} title="Markets" />
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
