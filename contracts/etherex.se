# etherex.se -- Ethereum contract
#
# Copyright (c) 2014-2015 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

#
# EtherEx
#

data markets[2^160](id, name, contract, decimals, precision, minimum, category, last_price, owner, block, total_trades, last_trade, trade_ids[](id, next_id, prev_id))
data markets_id[2^160](id)  # Reverse Market ID lookup by contract address
data markets_name[2^160](id)  # Reverse Market ID lookup by name
data trades[2^160](id, type, market, amount, price, owner, block, refhash)
data balances[][](available, trading)
data last_market

event log_price(market:indexed, type, price, amount, timestamp)
event log_add_tx(market:indexed, sender, type, price, amount, tradeid)
event log_fill_tx(market:indexed, sender:indexed, owner:indexed, type, price, amount, tradeid)
event log_deposit(market:indexed, sender:indexed, amount)
event log_withdraw(market:indexed, sender:indexed, amount)
event log_cancel(market:indexed, sender, price, amount, tradeid)
event log_market(id)

extern subcurrency: [allowance:[int256,int256]:int256, approve:[int256,int256]:int256, balance:[]:int256, balanceOf:[int256]:int256, transfer:[int256,int256]:int256, transferFrom:[int256,int256,int256]:int256]


# Trade types
macro BID: 1
macro ASK: 2

# Field counts
macro MARKET_FIELDS: 12
macro TRADE_FIELDS: 8

# Boolean success/failure
macro SUCCESS: 1
macro FAILURE: 0


#
# Error codes
#

# Trades
macro MISSING_AMOUNT: 2
macro MISSING_PRICE: 3
macro MISSING_MARKET_ID: 4

macro INSUFFICIENT_BALANCE: 10
macro INSUFFICIENT_TRADE_AMOUNT: 11
macro INSUFFICIENT_VALUE: 12

macro TRADE_AMOUNT_MISMATCH: 20
macro TRADE_ALREADY_EXISTS: 21
macro TRADE_SAME_BLOCK_PROHIBITED: 22

macro MARKET_NAME_INVALID: 30
macro MARKET_NAME_ALREADY_EXISTS: 31
macro MARKET_CONTRACT_INVALID: 32
macro MARKET_CATEGORY_INVALID: 33
macro MARKET_DECIMALS_INVALID: 34
macro MARKET_PRECISION_INVALID: 35
macro MARKET_MINIMUM_INVALID: 36

macro MARKET_NONSTANDARD_ALLOWANCE: 40
macro MARKET_NONSTANDARD_APPROVE: 41
macro MARKET_NONSTANDARD_BALANCEOF: 42
macro MARKET_NONSTANDARD_TRANSFER: 43
macro MARKET_NONSTANDARD_TRANSFERFROM: 44

#
# Function macros
#
macro refund():
    if msg.value > 0:
        send(msg.sender, msg.value)

macro check_trade($amount, $price, $market_id):
    if amount <= 0:
        return(MISSING_AMOUNT)
    if price <= 0:
        return(MISSING_PRICE)
    if market_id <= 0:
        return(MISSING_MARKET_ID)

macro save_trade($type, $amount, $price, $market_id):
    trade = [$type, $market_id, $amount, $price, msg.sender, block.number]
    trade_id = sha3(trade:arr)

    # Save trade
    if !self.trades[trade_id].id:
        self.trades[trade_id].id = trade_id
        self.trades[trade_id].type = $type
        self.trades[trade_id].market = $market_id
        self.trades[trade_id].amount = $amount
        self.trades[trade_id].price = $price
        self.trades[trade_id].owner = msg.sender
        self.trades[trade_id].block = block.number
        self.trades[trade_id].refhash = ref(self.trades[trade_id].id)

        # Update market
        last_id = self.markets[$market_id].last_trade
        self.markets[$market_id].trade_ids[last_id].next_id = trade_id
        self.markets[$market_id].trade_ids[trade_id].prev_id = last_id
        self.markets[$market_id].trade_ids[trade_id].id = trade_id
        self.markets[$market_id].last_trade = trade_id
        self.markets[$market_id].total_trades += 1

        # Update available and trading amounts for asks
        if $type == ASK:
            self.balances[msg.sender][$market_id].available -= $amount
            self.balances[msg.sender][$market_id].trading += $amount
    else:
        return(TRADE_ALREADY_EXISTS)

    # Log transaction
    log(type=log_add_tx, $market_id, msg.sender, $type, $price, $amount, trade_id)

    return(trade_id)

macro remove_trade($trade_id, $market_id):
    self.trades[$trade_id].id = 0
    self.trades[$trade_id].type = 0
    self.trades[$trade_id].market = 0
    self.trades[$trade_id].amount = 0
    self.trades[$trade_id].price = 0
    self.trades[$trade_id].owner = 0
    self.trades[$trade_id].block = 0
    self.trades[$trade_id].refhash = 0

    prev_id = self.markets[$market_id].trade_ids[$trade_id].prev_id
    next_id = self.markets[$market_id].trade_ids[$trade_id].next_id
    if prev_id and next_id:
        self.markets[$market_id].trade_ids[prev_id].next_id = next_id
        self.markets[$market_id].trade_ids[next_id].prev_id = prev_id
    elif prev_id:
        self.markets[$market_id].last_trade = prev_id
        self.markets[$market_id].trade_ids[prev_id].next_id = 0

    if next_id:
        self.markets[$market_id].trade_ids[$trade_id].next_id = 0
    if prev_id:
        self.markets[$market_id].trade_ids[$trade_id].prev_id = 0
    self.markets[$market_id].trade_ids[$trade_id].id = 0
    self.markets[$market_id].total_trades -= 1


#
# Get price by market ID
#
def price(market_id):
    refund()
    return(self.markets[market_id].last_price)

#
# Buy / Sell actions
#
def buy(amount, price, market_id):
    check_trade(amount, price, market_id)

    # Calculate ETH value
    value = ((amount * price) / (self.markets[market_id].precision * 10 ^ self.markets[market_id].decimals)) * 10 ^ 18

    #
    # Check buy value
    #
    if msg.value < self.markets[market_id].minimum:
        refund()
        return(INSUFFICIENT_TRADE_AMOUNT)

    # Check msg.value and value match
    if msg.value < value:
        refund()
        return(TRADE_AMOUNT_MISMATCH)

    # Refund excess value
    if msg.value > value:
        send(msg.sender, msg.value - value)

    save_trade(BID, amount, price, market_id)

    return(FAILURE)


def sell(amount, price, market_id):
    check_trade(amount, price, market_id)

    # Calculate ETH value
    value = ((amount * price) / (self.markets[market_id].precision * 10 ^ self.markets[market_id].decimals)) * 10 ^ 18

    #
    # Check sell value
    #
    if value < self.markets[market_id].minimum:
        refund()
        return(INSUFFICIENT_TRADE_AMOUNT)

    # Check balance of subcurrency
    balance = self.balances[msg.sender][market_id].available
    if balance >= amount:
        save_trade(ASK, amount, price, market_id)

    return(FAILURE)

#
# Trade
#
def trade(max_amount, trade_ids:arr):
    # Set max_value from initial msg.value
    max_value = msg.value

    # Try to fulfill each trade passed
    t = 0
    while t < len(trade_ids):
        trade_id = trade_ids[t]

        # Make sure the trade has been mined, obvious HFT prevention
        if block.number <= self.trades[trade_id].block:
            return(TRADE_SAME_BLOCK_PROHIBITED)

        # Get market
        market_id = self.trades[trade_id].market
        contract = self.markets[market_id].contract
        decimals = self.markets[market_id].decimals
        precision = self.markets[market_id].precision
        minimum = self.markets[market_id].minimum

        # Get trade
        type = self.trades[trade_id].type
        amount = self.trades[trade_id].amount
        price = self.trades[trade_id].price
        owner = self.trades[trade_id].owner

        # Fill buy order
        if type == BID:

            # Get available balance
            balance = self.balances[msg.sender][market_id].available

            if balance > 0:

                # Determine fill amount
                fill = min(amount, min(balance, max_amount))

                # Calculate value
                value = ((fill * price) * 10 ^ 18) / (precision * 10 ^ decimals)

                # Check buy value
                if value < minimum:
                    if max_value > 0:
                        send(msg.sender, max_value)
                    return(INSUFFICIENT_VALUE)

                # Update trade amount or remove
                if fill < amount:
                    self.trades[trade_id].amount -= fill
                else:
                    remove_trade(trade_id, market_id)

                # Update balances
                self.balances[msg.sender][market_id].available -= fill
                self.balances[owner][market_id].available += fill

                # Transfer ETH
                send(msg.sender, value)

                # Log transaction
                log(type=log_fill_tx, market_id, msg.sender, owner, ASK, price, fill, trade_id)
            else:
                return(INSUFFICIENT_BALANCE)

        elif type == ASK:

            if max_value > 0:

                # Check sell value
                if max_value < minimum:
                    if max_value > 0:
                        send(msg.sender, max_value)
                    return(INSUFFICIENT_VALUE)

                # Calculate value of trade
                trade_value = ((amount * price) * 10 ^ 18) / (precision * 10 ^ decimals)

                # Determine fill value
                value = min(max_value, trade_value)

                # Calculate fill amount, update trade amount or remove filled trade
                if value < trade_value:
                    fill = ((value * (precision * 10 ^ decimals)) / price) / 10 ^ 18
                    self.trades[trade_id].amount -= fill
                else:
                    fill = amount
                    remove_trade(trade_id, market_id)

                # Update balances
                self.balances[owner][market_id].trading -= fill
                self.balances[msg.sender][market_id].available += fill

                # Transfer ETH
                send(owner, value)

                # Log transaction
                log(type=log_fill_tx, market_id, msg.sender, owner, BID, price, fill, trade_id)
            else:
                return(INSUFFICIENT_BALANCE)

        # Update market last price
        self.markets[market_id].last_price = price

        # Log price, fill amount, type and timestamp
        log(type=log_price, market_id, type, price, fill, block.timestamp)

        # Update max_amount and max_value
        max_amount -= fill
        max_value -= value

        # Next trade
        t += 1

    # Refund excess value
    if max_value:
        send(msg.sender, max_value)

    return(SUCCESS)

#
# Deposit - called from the user only, after calling "approve" on the token
#
def deposit(amount, market_id):
    # Transfer funds to the exchange
    if self.markets[market_id].contract.transferFrom(msg.sender, self, amount):
        balance = self.balances[msg.sender][market_id].available
        new_balance = balance + amount
        self.balances[msg.sender][market_id].available = new_balance
        log(type=log_deposit, market_id, msg.sender, amount)
        return(new_balance)
    return(FAILURE)

#
# Withdrawal - to subcurrency contracts only
#
def withdraw(amount, market_id):
    balance = self.balances[msg.sender][market_id].available
    if balance >= amount:
        self.balances[msg.sender][market_id].available = balance - amount
        result = self.markets[market_id].contract.transfer(msg.sender, amount)
        log(type=log_withdraw, market_id, msg.sender, amount)
        return(result)
    return(FAILURE)

#
# Cancellation
#
def cancel(trade_id):
    # Get trade
    type = self.trades[trade_id].type
    amount = self.trades[trade_id].amount
    price = self.trades[trade_id].price
    owner = self.trades[trade_id].owner

    # Get market
    market_id = self.trades[trade_id].market
    contract = self.markets[market_id].contract
    decimals = self.markets[market_id].decimals
    precision = self.markets[market_id].precision

    # Check the owner
    if msg.sender == owner:

        # Clear the trade first
        remove_trade(trade_id, market_id)

        # Issue refunds
        if type == BID:
            # ETH refund
            value = ((amount * price) / (precision * 10 ^ decimals)) * 10 ^ 18
            send(msg.sender, value)

        elif type == ASK:
            # Subcurrency refund
            self.balances[msg.sender][market_id].trading -= amount
            self.balances[msg.sender][market_id].available += amount

        # Log cancellation
        log(type=log_cancel, market_id, msg.sender, price, amount, trade_id)

        return(SUCCESS)

    return(FAILURE)

#
# Add market
#
def add_market(name, contract, decimals, precision, minimum, category):
    # Get the next market ID
    id = self.last_market + 1

    if name <= 0:
        return MARKET_NAME_INVALID
    if self.markets_name[name].id:
        return MARKET_NAME_ALREADY_EXISTS
    if contract <= 0:
        return MARKET_CONTRACT_INVALID
    if category < 0:
        return MARKET_CATEGORY_INVALID
    if decimals < 0:
        return MARKET_DECIMALS_INVALID
    if precision < 0:
        return MARKET_PRECISION_INVALID
    if minimum < 0:
        return MARKET_MINIMUM_INVALID

    # Check Standard Token support
    if contract.allowance(msg.sender, self) != 0:
        return MARKET_NONSTANDARD_ALLOWANCE
    if contract.approve(self, 0) != 1:
        return MARKET_NONSTANDARD_APPROVE
    if contract.balanceOf(self) != 0:
        return MARKET_NONSTANDARD_BALANCEOF
    if contract.transfer(msg.sender, 0) != 0:
        return MARKET_NONSTANDARD_TRANSFER
    if contract.transferFrom(self, msg.sender, 0) != 0:
        return MARKET_NONSTANDARD_TRANSFERFROM

    self.markets[id].id = id
    self.markets[id].name = name
    self.markets[id].contract = contract
    self.markets[id].category = category
    self.markets[id].decimals = decimals
    self.markets[id].precision = precision
    self.markets[id].minimum = minimum
    self.markets[id].last_price = 1
    self.markets[id].owner = msg.sender
    self.markets[id].block = block.number

    # Set reverse lookup ID
    self.markets_id[contract].id = id
    self.markets_name[name].id = id

    # Set last market ID
    self.last_market = id

    # Log new market
    log(type=log_market, id)

    return(SUCCESS)

#
# Getters
#
def get_market_id(address):
    return(self.markets_id[address].id)

def get_market_id_by_name(name):
    return(self.markets_name[name].id)

def get_last_market_id():
    return(self.last_market)

def get_market(id):
    market = array(MARKET_FIELDS - 1)

    market[0] = self.markets[id].id
    market[1] = self.markets[id].name
    market[2] = self.markets[id].contract
    market[3] = self.markets[id].decimals
    market[4] = self.markets[id].precision
    market[5] = self.markets[id].minimum
    market[6] = self.markets[id].last_price
    market[7] = self.markets[id].owner
    market[8] = self.markets[id].block
    market[9] = self.markets[id].total_trades
    market[10] = self.markets[id].category

    if market:
        return(market:arr)
    return([FAILURE]:arr)

def get_trade_ids(market_id):
    trades_count = self.markets[market_id].total_trades
    trade_id = self.markets[market_id].last_trade
    trade_ids = array(trades_count)

    i = 0
    while i < trades_count:
        trade_ids[i] = self.markets[market_id].trade_ids[trade_id].id
        trade_id = self.markets[market_id].trade_ids[trade_id].prev_id
        i = i + 1

    if trade_ids:
        return(trade_ids:arr)
    return([FAILURE]:arr)

def get_trade(id):
    trade = array(TRADE_FIELDS)

    trade[0] = self.trades[id].id
    trade[1] = self.trades[id].type
    trade[2] = self.trades[id].market
    trade[3] = self.trades[id].amount
    trade[4] = self.trades[id].price
    trade[5] = self.trades[id].owner
    trade[6] = self.trades[id].block
    trade[7] = self.trades[id].refhash

    if trade:
        return(trade:arr)
    return([FAILURE]:arr)

def get_sub_balance(address, market_id):
    return([self.balances[address][market_id].available, self.balances[address][market_id].trading]:arr)
