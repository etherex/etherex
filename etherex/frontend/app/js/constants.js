var keyMirror = require('react/lib/keyMirror');

module.exports = {
  CHANGE_EVENT: "change",
  contact: keyMirror({
    ADD_CONTACT: null,
    REMOVE_CONTACT: null
  }),
  trade: keyMirror ({
    LOAD_TRADES: null,
    LOAD_TRADES_FAIL: null,
    LOAD_TRADES_SUCCESS: null,
    ADD_TRADE: null
  }),
  reference: keyMirror({
    ADD_REFERENCE: null
  }),
  user: keyMirror ({
    LOAD_ADDRESSES: null,
    LOAD_ADDRESSES_FAIL: null,
    LOAD_ADDRESSES_SUCCESS: null,
    LOAD_ADDRESSES: null,
    UPDATE_BALANCE: null,
    UPDATE_BALANCE_SUB: null,
    DEPOSIT: null,
    WITHDRAW: null
  }),
  market: keyMirror ({
    CHANGE_MARKET: null,
    LOAD_MARKETS: null,
    LOAD_MARKETS_FAIL: null,
    LOAD_MARKETS_SUCCESS: null
  })
};
