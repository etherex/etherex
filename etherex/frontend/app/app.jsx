/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var Router = require("react-router");

/* global window */
// expost React globally for DevTools
window.React = React;

var EtherExApp = require("./components/EtherExApp");

var Placeholder = require("./components/Placeholder");

var Trades = require("./components/Trades");
var TradeStore = require("./stores/TradeStore");
var TradeActions = require("./actions/TradeActions");
// var TradeDetails = require("./components/TradeDetails");

var UserStore = require("./stores/UserStore");
var UserActions = require("./actions/UserActions");
var UserDetails = require("./components/UserDetails");

var MarketStore = require("./stores/MarketStore");
var MarketActions = require("./actions/MarketActions");

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


// eth.js compatibility
if (!ethBrowser) {
  var bigInt = require("./js/eth/BigInteger.js");
  window.bigInt = bigInt;

  require("./js/eth/ethString.js");

  var eth = require("./js/eth/eth.js");
  window.eth = eth;

  eth.stateAt = eth.storageAt;
  eth.messages = function() { return {}; };
  eth.toDecimal = function(x) { return x.dec(); };
  eth.fromAscii = function(x) { return x.unbin(); };
  eth.toAscii = function(x) { return x.bin().unpad(); };
  eth.pad = function(x, l) { return String(x).pad(l); };
  eth.oldtransact = function(i, c) { // a_s, f_v, t, d, g, p, f) {
    if (i.to == null) {
      var r = eth.transact(JSON.stringify(i.from));
      if (i.value)
        i.value(r);
    }
    else {
      console.log('POC 5 eth.transact is deprecated, tell DEV to fix eth.js');
      eth.transact(i.from, i.value, i.to, i.data, i.gas, i.gasPrice);
      if (f) f();
    }
  }
}

// old scripts / TODOs
require("./js/scripts.js");

var Route = Router.Route;
var Routes = Router.Routes;
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

var routes = (
  <Routes>
    <Route handler={EtherExApp} flux={flux}>
      <Redirect from="/" to="trades" />
      <Route name="trades" path="/trades" handler={Trades} flux={flux} title="Trades" />
      <Route name="trades/xchain" path="/trades/xchain" handler={Trades} flux={flux} title="X-Chain" />
      <Route name="trades/marketplace" path="/trades/marketplace" handler={Trades} flux={flux} title="Marketplace" />
      <Route name="tradeDetails" path="/trade/:tradeId" handler={Placeholder} flux={flux} title="Trade details" />
      <Route name="assets" path="/assets" handler={Placeholder} flux={flux} title="Assets" />
      <Route name="wallet" path="/wallet" handler={Placeholder} flux={flux} title="Wallet" />
      <Route name="tools" path="/tools" handler={Placeholder} flux={flux} title="Tools" />
      <Route name="help" path="/help" handler={Placeholder} flux={flux} title="Help" />
      <Route name="userDetails" path="/user/:userId" handler={Placeholder} flux={flux} title="User details" />
      <Route name="notfound" path="/notfound" handler={Placeholder} title="User or Trade ID not found" flux={flux} />
    </Route>
  </Routes>
);

/* global document */
React.renderComponent(routes, document.getElementById("app"));
