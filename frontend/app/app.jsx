var localesSupported = require('intl-locales-supported');
var i18n = {
    locales: ['en-US']
};
if (window.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!localesSupported(i18n.locales)) {
    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and replace the constructors with need with the polyfill's.
    require('intl');
    Intl.NumberFormat   = window.IntlPolyfill.NumberFormat;
    Intl.DateTimeFormat = window.IntlPolyfill.DateTimeFormat;
  }
} else {
  // No `Intl`, so use and load the polyfill.
  window.Intl = require('intl');
}

var React = require("react/addons");
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
var Help = require("./components/Help");

// Load bootstrap
var jQuery = require("jquery");
window.$ = window.jQuery = jQuery;
require("bootstrap/dist/js/bootstrap.js");
require("./css/bootstrap-darkly.css");

require("./css/styles.css");

var intlData = require('./js/intlData');

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

flux.setDispatchInterceptor(function(action, dispatch) {
  React.addons.batchedUpdates(function() {
    dispatch(action);
  });
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
      <Route name="help" path="/help" handler={Help} flux={flux} title="Help" />
      <Route name="userDetails" path="/user" handler={UserDetails} flux={flux} title="User details" />
      <NotFoundRoute name="notfound" handler={Placeholder} title="User or Trade ID not found" flux={flux} />
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux} locales={i18n.locales} {...intlData} />, document.body);
});
