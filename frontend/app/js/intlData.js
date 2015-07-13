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
    "markets": "Markets",
    "amount": "Amount",
    "total": "Total",
    "by": "By",
    "network": "Network",
    "blocktime": "{time, number} s",
    "ether": "{value, number} {unit}",
    "init": {
      "loading": "Ethereum loading...",
      "ready": "The Ethereum block chain is current. Just a few more seconds...",
      "not_ready": `The Ethereum block chain is not current and
                    {peers, plural,
                      =0 {we're looking for peers}
                      other {is fetching blocks from # peers}}.`,
      "force": "Load anyway",
      "failed": {
        "header": "EtherEx failed to load",
        "explain": "There was a problem loading EtherEx.",
        "assistance": "Visit #etherex on IRC for assitance."
      },
      "connect": {
        "failed": "Ethereum not found",
        "explain": `EtherEx requires an Ethereum client to be running and current.
                    EtherEx could not detect a client running which probably means
                    it's not installed, running or is misconfigured.`,
        "assistance": `Get help installing and configuring Ethereum`
      },
      "install": {
        "title": "Installing and configuring Ethereum",
        "OSX": {
          "brew": `<a target="_blank" href="http://brew.sh/">Install Homebrew</a> for Mac OS, then:`,
          "install": `brew tap ethereum/ethereum\nbrew install ethereum`,
          "link": `See also the <a href="{wiki}" target="_blank">Wiki page</a>
                  and the <a href="{brew}" target="_blank">homebrew-ethereum README</a>.`
        },
        "Ubuntu": {
          "PPA": `sudo apt-get install software-properties-common\nsudo add-apt-repository ppa:ethereum/ethereum\nsudo apt-get update\nsudo apt-get install ethereum`,
          "link": `See also the <a href="{wiki}" target="_blank">Wiki page</a>
                  and the <a href="{ppa}" target="_blank">PPA repository</a>.`
        },
        "Win": {
          "install": `Download the
                        <a href="https://build.ethdev.com/builds/Windows%20Go%20develop%20branch/Geth-Win64-latest.zip">
                          lastest geth build
                        </a>
                      for Windows`,
          "link": `See also the <a href="{wiki}" target="_blank">Wiki page</a>
                  and the <a href="{choco}" target="_blank">Chocolatery package</a>.`
        },
        "Others": {
          "build": `Follow the Ethereum
                      <a href="https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum">
                        install guide
                      </a>
                    on GitHub`
        },
        "installed": `Once <pre className="small">geth</pre> is installed:`,
        "account": `Add a new account using: { geth }`,
        "start": `Start geth with: { geth }`
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
    "nav": {
      "toggle": "Toggle navigation",
      "categories": "Categories",
      "trades": "Trades",
      "markets": "Markets",
      "wallet": "Wallet",
      "tools": "Tools",
      "help": "Help"
    },
    "sections": {
      "sub": "Subcurrencies",
      "xchain": "X-Chain",
      "assets": "Assets",
      "currencies": "Currencies"
    },
    "wallet": {
      "balance": "In {currency} wallet: {balance, number}",
      "available": "Available {currency} balance: {balance, number}",
      "trading": "In trades {currency}: {balance, number}",
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
      "market": "Market",
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
      "refresh": "Refresh",
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
      "send": "Are you sure you want to send {amount, number} {currency} to {recipient}?",
      "not_enough": "Not enough {currency} available to send, got {balance, number}"
    },
    "withdraw": {
      "currency": "Withdraw {currency}",
      "confirm": "Are you sure you want to withdraw {amount, number} {currency}?",
      "not_enough": "Not enough {currency} available for withdrawal, got {balance, number}, needs {amount, number}",
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
                  } {amount, number} {currency} at {price, number} {currency}/ETH for {total, number} ETH?`,
      "adding": `You will be adding a new trade of {amount, number} {currency}
                  at {price, number} {currency}/ETH for {total, number} ETH.`,
      "filling": `You will be filling
                  {numTrades, plural, =1 {one trade} other {# trades}}
                  for a total of {total, number} ETH
                  {left, plural,
                    =0 {}
                    other {({balance, number} ETH left going in your pocket)}}.`,
      "also_adding": `You will also be adding a new trade of {amount, number} {currency}
                      at {price, number} {currency}/ETH for {total, number} ETH.`,
      "not_left": `Not enough left for a new trade with {amount, number} for {total, number} ETH.`,
      "minimum": `Minimum total is {minimum, number} ETH`,
      "not_total": `Not enough ETH for this trade, {minimum, number} ETH required.`,
      "not_enough": `Not enough {currency} for this trade, {amount, number} {currency} required.`
    },
    "txs": {
      "block": "Block #",
      "inout": "In / Out",
      "type": "Type",
      "fromto": "From / To",
      "price": "Price",
      "amount": "Amount",
      "totaleth": "Total ETH",
      "details": "Details",
      "hash": "Hash",
      "id": "Trade ID"
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
