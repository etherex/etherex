module.exports = {
  "locales": "en-US",
  "formats": {
    "date": {
      "short": {
        "day": "numeric",
        "month": "long",
        "year": "numeric"
      },
      "long": {
        "day": "numeric",
        "month": "short",
        "year": "numeric",
        "hour": "numeric",
        "minute": "numeric",
        "second": "numeric"
      }
    },
    "number": {
      "USD": {
        "style": "currency",
        "currency": "USD",
        "minimumFractionDigits": 2
      }
    },
  },
  "messages": {
    "loading": "loading",
    "error": "Error!",
    "slogan": "A Decentralized Future Calls For A Decentralized Exchange.",
    "balance": "Balance",
    "available": "Available",
    "trading": "Trading",
    "last": "Last Price",
    "price": "{price, number} {currency}/ETH",
    "trades": "Trades",
    "init": {
      "loading": "Ethereum loading...",
      "ready": "The Ethereum block chain is current. Just a few more seconds...",
      "not_ready": "The Ethereum block chain is not current and is fetching blocks from peers.",
      "force": "Load anyway",
      "failed": {
        "header": "EtherEx failed to load",
        "explain": "There was a problem loading EtherEx.",
        "assistance": "Visit #etherex on IRC for assitance."
      },
      "connect": {
        "failed": "Failed to connect to Ethereum",
        "explain": "EtherEx requires a local node of the Ethereum client running.",
        "assistance": 'Visit <a href="https://github.com/ethereum/go-ethereum/wiki">the Ethereum wiki on GitHub</a> for help installing the latest client.',
        "installed": "If geth is installed:"
      },
      "block": {
        "age": "Last block was {age}.",
        "left": "Approximately {left, number} blocks left to go.",
        "genesis": "No block mined. This is the genesis."
      }
    },
    "demo": {
      "proceed": "Proceed in demo mode"
    },
    "wallet": {
      "balance": "In {currency} wallet: {balance, number}",
      "available": "Available {currency} balance: {balance, number}",
      "trading": "{currency} in trades: {balance, number}",
      "sub": "{balance, number} {currency}",
      "pending": `{currency} balance: {balance, number}
                  {pending, plural,
                    =0 {}
                    other {(# pending)}
                  }`
    },
    "confirm": {
      "required": "Confirmation required",
      "estimate": "Gas cost estimate (probably wrong)",
      "no": "No",
      "yes": "Yes"
    },
    "form": {
      "buy": "Buy",
      "sell": "Sell",
      "buyorsell": "Buy or Sell",
      "amount": "Amount",
      "price": "Price",
      "total": "Total",
      "trade": "Place trade",
      "new": "New Trade",
      "deposit": "Deposit",
      "withdraw": "Withdraw",
      "recipient": "Recipient",
      "address": "Address",
      "empty": "Fill it up mate!",
      "cheap": "Don't be cheap...",
      "warning": "Warning!",
      "yours": "Your trades"
    },
    "config": {
      "title": "Configuration",
      "current": "Current EtherEx address",
      "new": "New address",
      "timeout": "Network timeout (seconds)",
      "update": "Update",
      "debug_mode": "Debug mode",
      "debug_warning": "This prints a truckload of logs to the console and can slow down the UI considerably.",
      "address": "Are you sure you want to change the exchange's address to {address} ?",
      "si": "Use named large numbers for balances"
    },
    "address": {
      "size": `Address too {size, select,
                short {short}
                long {long}
              }.`
    },
    "deposit": {
      "currency": "Deposit {currency}",
      "confirm": "Are you sure you want to deposit {amount, number} {currency}?",
      "not_enough": "Not enough {currency} for a deposit of {amount, number}, you have {balance, number}"
    },
    "sub": {
      "send": "Are you sure you want to send {amount} {currency} to {recipient}?",
      "not_enough": "Not enough {currency} available to send, got {balance}"
    },
    "withdraw": {
      "currency": "Withdraw {currency}",
      "confirm": "Are you sure you want to withdraw {amount} {currency} ?",
      "not_enough": "Not enough {currency} available for withdrawal, got {balance, number}, needs {amount}",
      "empty": "Dont' be cheap to yourself..."
    },
    "send": {
      "send": "Send",
      "currency": "Send {currency}"
    },
    "market": {
      "favorite": "Favorite",
      "pair": "Currency pair",
      "change": "% change in<br />24h/1w/1m"
    },
    "trade": {
      "asks": "Asks",
      "bids": "Bids",
      "cancel": "Are you sure you want to cancel this trade?",
      "confirm": `Are you sure you want to {type, select,
                    buy {buy}
                    sell {sell}
                  } {amount} {currency} at {price} {currency}/ETH for {total} ETH?`,
      "filling": `You will be filling
                  {numTrades, plural, =1 {one trade} other {# trades}}
                  for a total of {total} ETH
                  {left, plural,
                    =0 {}
                    other {({balance} ETH left going in your pocket)}}.`,
      "adding": `You will also be adding a new trade of {amount} {currency}
                  at {price} {currency}/ETH for {total} ETH.`,
      "not_left": `Not enough left for a new trade with {amount} for {total} ETH.`,
      "minimum": `Minimum total is {minimum} ETH`,
      "not_total": `Not enough ETH for this trade, {minimum} required.`,
      "not_enough": `Not enough {currency} for this trade, {amount} {currency} required.`
    },
    "user": {
      "not_found": "User not found",
      "summary": "User summary",
      "address": "Current address",
      "switch": "Switch address",
      "sub": "Current {currency} balance",
      "balance": `{balance, number} {currency}
                  {pending, plural,
                    =0 {}
                    other {(# pending)}
                  }`
    },
    "hashrate": "{hashrate, number} H/s"
  }
};
