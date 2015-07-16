var localesSupported = require('intl-locales-supported');
var i18n = {
    locales: ['en-US']
};

if (window.Intl) {
  // Determine if the built-in `Intl` has the locale data we need.
  if (!localesSupported(i18n.locales)) {
    // `Intl` exists, but it doesn't have the data we need, so load the
    // polyfill and replace the constructors with need with the polyfill's.
    window.IntlPolyfill = require('intl/dist/Intl').IntlPolyfill;
    window.Intl.NumberFormat = window.IntlPolyfill.NumberFormat;
    window.Intl.DateTimeFormat = window.IntlPolyfill.DateTimeFormat;
  }
} else {
  // No `Intl`, so use and load the polyfill.
  window.Intl = require("intl/dist/Intl").Intl;
  window.IntlPolyfill = require("intl/dist/Intl").IntlPolyfill;
  window.Intl.NumberFormat = window.IntlPolyfill.NumberFormat;
  window.Intl.DateTimeFormat = window.IntlPolyfill.DateTimeFormat;
  require("intl/locale-data/jsonp/en-US");
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
var TicketStore = require("./stores/btcswap/TicketStore");

var ConfigActions = require("./actions/ConfigActions");
var NetworkActions = require("./actions/NetworkActions");
var UserActions = require("./actions/UserActions");
var TradeActions = require("./actions/TradeActions");
var MarketActions = require("./actions/MarketActions");
var TicketActions = require("./actions/btcswap/TicketActions");

var Trades = require("./components/Trades");
var Markets = require("./components/Markets");
var UserDetails = require("./components/UserDetails");
// var TradeDetails = require("./components/TradeDetails");
var Tickets = require("./components/btcswap/Tickets");
var CreateTicket = require("./components/btcswap/CreateTicket");
var ClaimTicket = require("./components/btcswap/ClaimTicket");
var BtcHelp = require("./components/btcswap/Help");
var Wallet = require("./components/Wallet");
var Tools = require("./components/Tools");
var Help = require("./components/Help");

// Load jQuery for bootstrap
var jQuery = require("jquery");
window.$ = window.jQuery = jQuery;

// Load fonts and icons
require("./css/fonts.css");
require("./css/icons.css");

// Load bootstrap
require("bootstrap/dist/js/bootstrap.js");

// Load Intl data
var intlData = require('./js/intlData');

// var Redirect = Router.Redirect;

var stores = {
  config: new ConfigStore(),
  network: new NetworkStore(),
  UserStore: new UserStore(),
  MarketStore: new MarketStore(),
  TradeStore: new TradeStore(),
  TicketStore: new TicketStore()
};

var actions = {
  config: new ConfigActions(),
  network: new NetworkActions(),
  user: new UserActions(),
  market: new MarketActions(),
  trade: new TradeActions(),
  ticket: new TicketActions()
};

var flux = new Fluxxor.Flux(stores, actions);

flux.setDispatchInterceptor(function(action, dispatch) {
  React.addons.batchedUpdates(function() {
    dispatch(action);
  });
});

var routes = (
    <Route name="app" handler={EtherExApp} flux={flux}>
      <DefaultRoute handler={Trades} flux={flux} title="Home" />
      <Route name="home" path="/" handler={Trades} flux={flux} title="Trades" />
      <Route name="tradeDetails" path="/trade/:tradeId" handler={Placeholder} flux={flux} title="Trade details" />
      <Route name="markets" path="/markets" handler={Markets} flux={flux} title="Markets" />
      <Route name="subs" path="/markets/subs" handler={Markets} flux={flux} title="Subs" />
      <Route name="xchain" path="/markets/xchain" handler={Markets} flux={flux} title="X-Chain" />
      <Route name="assets" path="/markets/assets" handler={Markets} flux={flux} title="Assets" />
      <Route name="currencies" path="/markets/currencies" handler={Markets} flux={flux} title="Currencies" />
      <Route name="btc" path="/btc" handler={Tickets} flux={flux} title="BTC" />
      <Route name="sell" path="/btc/sell" handler={CreateTicket} flux={flux} title="Sell" />
      <Route name="claim" path="/btc/claim" handler={ClaimTicket} flux={flux} title="Claim" />
      <Route name="btc-help" path="/btc/help" handler={BtcHelp} flux={flux} title="Help" />
      <Route name="wallet" path="/wallet" handler={Wallet} flux={flux} title="Wallet" />
      <Route name="tools" path="/tools" handler={Tools} flux={flux} title="Tools" />
      <Route name="help" path="/help" handler={Help} flux={flux} title="Help" />
      <Route name="userDetails" path="/user" handler={UserDetails} flux={flux} title="User details" />
      <NotFoundRoute name="notfound" handler={Placeholder} flux={flux} title="User or Trade ID not found" />
    </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux} locales={i18n.locales} {...intlData} />, document.body);
});
