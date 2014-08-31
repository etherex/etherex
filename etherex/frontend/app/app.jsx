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

// var References = require("./components/References");
// var ReferenceStore = require("./stores/ReferenceStore");
// var ReferenceActions = require("./actions/ReferenceActions");

// var Contacts = require("./components/Contacts");
// var ContactStore = require("./stores/ContactStore");
// var ContactActions = require("./actions/ContactActions");
// var ContactDetails = require("./components/ContactDetails");

var UserStore = require("./stores/UserStore");
var UserActions = require("./actions/UserActions");

var MarketStore = require("./stores/MarketStore");
var MarketActions = require("./actions/MarketActions");

// TODO mock data
var fixtures = require("./js/fixtures");

// var Firebase = require("Firebase");
var EthereumClient = require("./clients/EthereumClient");
var client = new EthereumClient();

// Load jQuery and bootstrap
var jQuery = require("jquery");
window.$ = window.jQuery = jQuery;

require("bootstrap/dist/js/bootstrap.js");
// require("bootstrap/dist/css/bootstrap.min.css");
// require("bootstrap/dist/css/bootstrap-theme.min.css");
require("./css/bootstrap-darkly.css");

// require("./css/rickshaw.min.css");
require("./css/styles.css");

var Ethereum = require("ethereumjs-lib");
window.Ethereum = Ethereum;

if (!ethBrowser) {
  var bigInt = require("./js/eth/BigInteger.js");
  window.bigInt = bigInt;

  require("./js/eth/ethString.js");

  var eth = require("./js/eth/eth.js");
  window.eth = eth;

  eth.stateAt = eth.storageAt;
  eth.messages = function() { return {}; };
  eth.toDecimal = function(x) { return x.dec(); };
  eth.toAscii = function(x) { return x.bin().unpad(); };
  eth.pad = function(x, l) { return String(x).pad(l); };
}
else {
  console.log = env.note;
  window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    env.warn(
      'Error: ' + errorMsg +
      ', Script: ' + url +
      ', Line: ' + lineNumber +
      ', Column: ' + column +
      ', StackTrace: ' + String(errorObj)
    );
  }
}

require("./js/scripts.js");

var Route = Router.Route;
var Routes = Router.Routes;
var Redirect = Router.Redirect;

var stores = {
  MarketStore: new MarketStore({market: fixtures.market, markets: []}),
  TradeStore: new TradeStore(), // {trades: fixtures.trades}),
  UserStore: new UserStore({user: fixtures.user}),
  // ReferenceStore: new ReferenceStore({references: fixtures.referencesList}),
  // ContactStore: new ContactStore({contacts: fixtures.contacts}),
};

var actions = {
    market: new MarketActions(client),
    trade: new TradeActions(client),
    user: new UserActions(client),
    // reference: ReferenceActions,
    // contact: ContactActions,
};

var flux = new Fluxxor.Flux(stores, actions);

var routes = (
  <Routes>
    <Route handler={EtherExApp} flux={flux}>
      <Redirect from="/" to="trades" />
      <Route name="trades" path="/trades" handler={Trades} flux={flux} title="Trades" />
      <Route name="tradeDetails" path="/trade/:tradeId" handler={Placeholder} flux={flux} title="Trade details" />
      <Route name="wallet" path="/wallet" handler={Placeholder} flux={flux} title="Wallet" />
      <Route name="contacts" path="/contacts" handler={Placeholder} flux={flux} title="Contacts" />
      <Route name="contactDetails" path="/contact/:contactId" handler={Placeholder} flux={flux} title="Contact details" />
      <Route name="settings" path="/settings" handler={Placeholder} flux={flux} title="Settings" />
      <Route name="help" path="/help" handler={Placeholder} flux={flux} title="Help" />
      <Route name="notfound" path="/notfound" handler={Placeholder} title="Contact or Trade ID not found" flux={flux} />
    </Route>
  </Routes>
);

/* global document */
React.renderComponent(routes, document.getElementById("app"));
