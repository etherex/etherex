from sim import Block, Contract, Simulation, Tx, mktx, stop

# Constants to modify before contract creation
MERCHANT = "mike"
SHIPPER = "sam"
PRICE_ETHER = 3995
CONFIRMATION_TIMEOUT = 30 * 86400

# Status enumeration
S_START = 0
S_CUSTOMER_PAID = 1
S_SHIPPED = 2
S_REFUNDED = 3

# Constract Storage indexes
I_STATUS = 1000
I_CUSTOMER_ADDRESS = 1001
I_CUSTOMER_PAID_AMOUNT = 1002
I_CUSTOMER_PAID_TS = 1003

MIN_FEE = 1000

class Escrow(Contract):
    """
    Escrow example to demonstrate contract basics.

    Customer pays specified amount. Shipper confirms shipping and releases
    funds to Merchant. Otherwise when not confirmed within a certain timeframe the
    Customer is refunded.

    Constants:
        MERCHANT - Address of the Merchant
        SHIPPER - Address of the Shipper
        PRICE_ETHER - Price of the order in Ether
        CONFIRMATION_TIMEOUT - Amount of seconds after which the customer can be refunded

    Storage:
        1000: Status (I_STATUS)
            0 = start (S_START)
            1 = customer paid (S_CUSTOMER_PAID)
            2 = shipped (S_SHIPPED)
            3 = customer refunded (S_REFUNDED)
        1001: Customer address (I_CUSTOMER_ADDRESS)
        1002: Customer paid amount (I_CUSTOMER_PAID_AMOUNT)
        1003: Customer paid timestamp (I_CUSTOMER_PAID_TS)

    Tx Triggers:
        Customer:
            sufficient amount => pay
        Shipper:
            mark as shipped
        Anyone:
            trigger expiration
    """

    def run(self, tx, contract, block):
        if tx.value < MIN_FEE * block.basefee:
            stop("Insufficient fee")

        state = contract.storage[I_STATUS]
        if state == S_START and tx.value >= PRICE_ETHER:
            contract.storage[I_STATUS] = S_CUSTOMER_PAID
            contract.storage[I_CUSTOMER_ADDRESS] = tx.sender
            contract.storage[I_CUSTOMER_PAID_AMOUNT] = tx.value
            contract.storage[I_CUSTOMER_PAID_TS] = block.timestamp
        elif state == S_CUSTOMER_PAID:
            if tx.sender == SHIPPER:
                contract.storage[I_STATUS] = S_SHIPPED
                mktx(MERCHANT, contract.storage[I_CUSTOMER_PAID_AMOUNT], 0, 0)
            elif block.timestamp >= contract.storage[I_CUSTOMER_PAID_TS] + CONFIRMATION_TIMEOUT:
                contract.storage[I_STATUS] = S_REFUNDED
                mktx(contract.storage[I_CUSTOMER_ADDRESS], contract.storage[I_CUSTOMER_PAID_AMOUNT], 0, 0)
        else:
            stop("Invalid state transition")


# Constants for test purposes
CUSTOMER = "carol"
TS = 1392000000

class EscrowRun(Simulation):

    def test_insufficient_fee(self):
        contract = Escrow()

        tx = Tx(sender=CUSTOMER, value=10)
        self.run(tx, contract)

        assert self.stopped == 'Insufficient fee'

    def test_customer_paid(self):
        contract = Escrow()

        tx = Tx(sender=CUSTOMER, value=PRICE_ETHER)
        block = Block(timestamp=TS)
        self.run(tx, contract, block)

        assert contract.storage[I_STATUS] == S_CUSTOMER_PAID
        assert contract.storage[I_CUSTOMER_ADDRESS] == CUSTOMER
        assert contract.storage[I_CUSTOMER_PAID_AMOUNT] == PRICE_ETHER
        assert contract.storage[I_CUSTOMER_PAID_TS] == TS

    def test_shipped(self):
        contract = Escrow()

        tx = Tx(sender=CUSTOMER, value=PRICE_ETHER)
        block = Block(timestamp=TS)
        self.run(tx, contract, block)

        tx = Tx(sender=SHIPPER, value=MIN_FEE)
        block = Block(timestamp=TS + 1)
        self.run(tx, contract, block)

        assert contract.storage[I_STATUS] == S_SHIPPED
        assert len(contract.txs) == 1
        assert contract.txs == [(MERCHANT, PRICE_ETHER, 0, 0)]

    def test_confirmation_timeout(self):
        contract = Escrow()

        tx = Tx(sender=CUSTOMER, value=PRICE_ETHER)
        block = Block(timestamp=TS)
        self.run(tx, contract, block)

        tx = Tx(sender=CUSTOMER, value=MIN_FEE)
        block = Block(timestamp=TS + CONFIRMATION_TIMEOUT + 1)
        self.run(tx, contract, block)

        assert contract.storage[I_STATUS] == S_REFUNDED
        assert len(contract.txs) == 1
        assert contract.txs == [(CUSTOMER, PRICE_ETHER, 0, 0)]
