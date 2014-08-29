var keyMirror = require('react/lib/keyMirror');

module.exports = {
  CHANGE_EVENT: "change",
  contact: keyMirror({
    ADD_CONTACT: null,
    REMOVE_CONTACT: null
  }),
  trade: keyMirror ({
    ADD_TRADE: null
  }),
  reference: keyMirror({
    ADD_REFERENCE: null
  }),
  user: keyMirror ({
    UPDATE_BALANCE: null,
    UPDATE_BALANCE_SUB: null,
    DEPOSIT: null,
    WITHDRAW: null
  }),
  market: keyMirror ({
    CHANGE_MARKET: null
  })
};
