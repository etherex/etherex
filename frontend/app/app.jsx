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
var Wallet = require("./components/Wallet");
var Tools = require("./components/Tools");
var Help = require("./components/Help");

var Tickets = require("./components/btcswap/Tickets");
var CreateTicket = require("./components/btcswap/CreateTicket");
var ReserveTicket = require("./components/btcswap/ReserveTicket");
var ClaimTicket = require("./components/btcswap/ClaimTicket");
var BtcHelp = require("./components/btcswap/Help");

// Load fonts and icons
require("./css/fonts.css");
require("./css/icons.css");

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
  <Route name="app" handler={EtherExApp}>
    <DefaultRoute handler={Trades} title="Home" />
    <Route name="home" path="/" handler={Trades} title="Trades" />
    <Route name="tradeDetails" path="/trade/:tradeId" handler={Placeholder} title="Trade details" />
    <Route name="markets" path="/markets" handler={Markets} title="Markets" />
    <Route name="subs" path="/markets/subs" handler={Markets} title="Subs" />
    <Route name="xchain" path="/markets/xchain" handler={Markets} title="X-Chain" />
    <Route name="assets" path="/markets/assets" handler={Markets} title="Assets" />
    <Route name="currencies" path="/markets/currencies" handler={Markets} title="Currencies" />
    <Route name="btc" path="/btc" handler={Tickets} title="BTC" />
    <Route path="/btc/ticket" handler={Tickets} title="BTC">
      <Route name="ticket" path="/btc/ticket/:ticketId" handler={Tickets} title="BTC" />
    </Route>
    <Route name="sell" path="/btc/sell" handler={CreateTicket} title="Sell" />
    <Route name="reserve" path="/btc/reserve" handler={ReserveTicket} title="Reserve" />
    <Route name="claim" path="/btc/claim" handler={ClaimTicket} title="Claim" />
    <Route name="btc-help" path="/btc/help" handler={BtcHelp} title="Help" />
    <Route name="wallet" path="/wallet" handler={Wallet} title="Wallet" />
    <Route name="tools" path="/tools" handler={Tools} title="Tools" />
    <Route name="help" path="/help" handler={Help} title="Help" />
    <Route name="userDetails" path="/user" handler={UserDetails} title="User details" />
    <NotFoundRoute name="notfound" handler={Placeholder} title="User or Trade ID not found" />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler flux={flux} locales={i18n.locales} {...intlData} />, document.body);
});
