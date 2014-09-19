var keyMirror = require('react/lib/keyMirror');

module.exports = {
    CHANGE_EVENT: "change",
    trade: keyMirror ({
        LOAD_TRADES: null,
        LOAD_TRADES_FAIL: null,
        LOAD_TRADES_SUCCESS: null,
        LOAD_TRADES_PROGRESS: null,
        ADD_TRADE: null,
        ADD_TRADE_FAIL: null,
        FILL_TRADE: null,
        FILL_TRADE_FAIL: null,
        FILL_TRADES: null,
        FILL_TRADES_FAIL: null,
        CANCEL_TRADE: null,
        CANCEL_TRADE_FAIL: null,
        SWITCH_MARKET: null,
        SWITCH_MARKET_FAIL: null,
        SWITCH_TYPE: null,
        SWITCH_TYPE_FAIL: null
    }),
    user: keyMirror ({
        LOAD_USER: null,
        LOAD_USER_FAIL: null,
        LOAD_USER_SUCCESS: null,
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
