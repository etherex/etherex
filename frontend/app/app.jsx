import Fluxxor from 'fluxxor';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router';

import EtherExApp from './components/EtherExApp';

import Trades from './components/Trades';
import Markets from './components/Markets';
import UserDetails from './components/UserDetails';
import Wallet from './components/Wallet';
import Tools from './components/Tools';
import Help from './components/Help';
import Placeholder from './components/Placeholder';

import Tickets from './components/btcswap/Tickets';
import CreateTicket from './components/btcswap/CreateTicket';
import ReserveTicket from './components/btcswap/ReserveTicket';
import ClaimTicket from './components/btcswap/ClaimTicket';
import BtcHelp from './components/btcswap/Help';

import ConfigStore from './stores/ConfigStore';
import NetworkStore from './stores/NetworkStore';
import UserStore from './stores/UserStore';
import TradeStore from './stores/TradeStore';
import MarketStore from './stores/MarketStore';
import TicketStore from './stores/btcswap/TicketStore';

import ConfigActions from './actions/ConfigActions';
import NetworkActions from './actions/NetworkActions';
import UserActions from './actions/UserActions';
import TradeActions from './actions/TradeActions';
import MarketActions from './actions/MarketActions';
import TicketActions from './actions/btcswap/TicketActions';

// Load fonts and icons
require("./css/fonts.css");
require("./css/icons.css");

let stores = {
  config: new ConfigStore(),
  network: new NetworkStore(),
  UserStore: new UserStore(),
  MarketStore: new MarketStore(),
  TradeStore: new TradeStore(),
  TicketStore: new TicketStore()
};

let actions = {
  config: new ConfigActions(),
  network: new NetworkActions(),
  user: new UserActions(),
  market: new MarketActions(),
  trade: new TradeActions(),
  ticket: new TicketActions()
};

let flux = new Fluxxor.Flux(stores, actions);

let createFluxComponent = function (Component, props) {
  return <Component {...props} flux={flux} />;
};

flux.setDispatchInterceptor(function(action, dispatch) {
  ReactDOM.unstable_batchedUpdates(function() {
    dispatch(action);
  });
});

// Opt-out of fugly _k in query string
import createHistory from 'history/lib/createHashHistory';
let history = createHistory({
  queryKey: false
});

let routes = (
  <Router history={history} createElement={createFluxComponent}>
    <Route path="/" component={EtherExApp}>
      <IndexRoute component={Trades} />
      <Route path="trades" component={Trades} />
      <Route path="markets" component={Markets} />
      <Route path="markets/subs" component={Markets} />
      <Route path="markets/xchain" component={Markets} />
      <Route path="markets/assets" component={Markets} />
      <Route path="markets/currencies" component={Markets} />
      <Route path="btc/buy" component={Tickets} />
      <Route path="btc/sell" component={CreateTicket} />
      <Route path="btc/reserve" component={ReserveTicket} />
      <Route path="btc/claim" component={ClaimTicket} />
      <Route path="btc/help" component={BtcHelp} />
      <Route path="btc/tickets/:ticketId" component={Tickets} />
      <Route path="wallet" component={Wallet} />
      <Route path="tools" component={Tools} />
      <Route path="help" component={Help} />
      <Route path="user" component={UserDetails} />
      <Route path="*" component={Placeholder} />
    </Route>
  </Router>
);

ReactDOM.render(routes, document.getElementById('app'));
