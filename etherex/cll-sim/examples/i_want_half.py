from sim import Block, Contract, Simulation, Tx, mktx, stop

# Marriage contract with divorce clause.
# Inspired by Eddie Murphy - I want half
# https://www.youtube.com/watch?v=Q4YJHvzo2io
#
# by:
# - Yves Candel
# - Nick Savers
# - Joris Bontje

# Constract Storage indexes
I_STATE = 1000
I_PARTNER_1 = 1001
I_PARTNER_2 = 1002
I_WITHDRAW_TO = 1003
I_WITHDRAW_AMOUNT = 1004
I_WITHDRAW_CREATOR = 1005
I_DIVORCE_CREATOR = 1006

# Status enumeration
S_START = 0
S_PROPOSED = 1
S_MARRIED = 2
S_DIVORCED = 3

# Transaction triggers
TX_WITHDRAW = 1
TX_DIVORCE = 2

class Marriage(Contract):
    """
    Marriage contract with divorce clause.
    Inspired by Eddie Murphy - I want half
    https://www.youtube.com/watch?v=Q4YJHvzo2io
    """
    def run(self, tx, contract, block):
        if tx.value < 100 * block.basefee:
            stop("Insufficient fee")

        state = contract.storage[I_STATE]
        if state == S_START:
            contract.storage[I_PARTNER_1] = tx.sender
            contract.storage[I_PARTNER_2] = tx.data[0]
            contract.storage[I_STATE] = S_PROPOSED
        else:
            partner_1 = contract.storage[I_PARTNER_1]
            partner_2 = contract.storage[I_PARTNER_2]

            if state == S_PROPOSED and tx.sender == partner_2 and tx.data[0] == partner_1:
                contract.storage[I_STATE] = S_MARRIED

            elif state == S_MARRIED and tx.sender == partner_1 or tx.sender == partner_2:
                if tx.data[0] == TX_WITHDRAW:
                    creator = contract.storage[I_WITHDRAW_CREATOR]
                    if creator != 0 and contract.storage[I_WITHDRAW_TO] == tx.data[1] and contract.storage[I_WITHDRAW_AMOUNT] == tx.data[2] and creator != tx.sender:
                        mktx(tx.data[1], tx.data[2], 0, 0)
                        contract.storage[I_WITHDRAW_TO] = 0
                        contract.storage[I_WITHDRAW_AMOUNT] = 0
                        contract.storage[I_WITHDRAW_CREATOR] = 0
                    else:
                        contract.storage[I_WITHDRAW_TO] = tx.data[1]
                        contract.storage[I_WITHDRAW_AMOUNT] = tx.data[2]
                        contract.storage[I_WITHDRAW_CREATOR] = tx.sender

                elif tx.data[0] == TX_DIVORCE:
                    creator = contract.storage[I_DIVORCE_CREATOR]
                    if creator != 0 and creator != tx.sender:
                        balance = block.account_balance(contract.address)
                        mktx(partner_1, balance / 2, 0, 0)
                        mktx(partner_2, balance / 2, 0, 0)
                        contract.storage[I_STATE] = S_DIVORCED
                    else:
                        contract.storage[I_DIVORCE_CREATOR] = tx.sender

PARTNER_1 = "alice"
PARTNER_2 = "eddie"
MERCHANT_ADDRESS = "Butterfly Labs"
MERCHANT_AMOUNT = 99999

class MarriageRun(Simulation):

    contract = Marriage()

    def test_insufficient_fee(self):

        tx = Tx(sender=PARTNER_1, value=10)
        self.run(tx, self.contract)

        assert self.stopped == 'Insufficient fee'

    def test_proposal(self):
        tx = Tx(sender=PARTNER_1, value=100, data=[PARTNER_2])
        self.run(tx, self.contract)

        assert self.contract.storage[I_PARTNER_1] == PARTNER_1
        assert self.contract.storage[I_PARTNER_2] == PARTNER_2
        assert self.contract.storage[I_STATE] == S_PROPOSED

    def test_withdraw_not_married_fails(self):
        tx = Tx(sender=PARTNER_1, value=100, data=[TX_WITHDRAW, MERCHANT_ADDRESS, MERCHANT_AMOUNT])
        self.run(tx, self.contract)

        assert self.contract.storage[I_WITHDRAW_TO] == 0
        assert self.contract.storage[I_WITHDRAW_AMOUNT] == 0
        assert self.contract.storage[I_WITHDRAW_CREATOR] == 0

    def test_accept(self):
        tx = Tx(sender=PARTNER_2, value=100, data=[PARTNER_1])
        self.run(tx, self.contract)

        assert self.contract.storage[I_PARTNER_1] == PARTNER_1
        assert self.contract.storage[I_PARTNER_2] == PARTNER_2
        assert self.contract.storage[I_STATE] == S_MARRIED

    def test_withdraw_request(self):
        tx = Tx(sender=PARTNER_1, value=100, data=[TX_WITHDRAW, MERCHANT_ADDRESS, MERCHANT_AMOUNT])
        self.run(tx, self.contract)

        assert self.contract.storage[I_WITHDRAW_TO] == MERCHANT_ADDRESS
        assert self.contract.storage[I_WITHDRAW_AMOUNT] == MERCHANT_AMOUNT
        assert self.contract.storage[I_WITHDRAW_CREATOR] == PARTNER_1

    def test_withdraw_approval(self):
        tx = Tx(sender=PARTNER_2, value=100, data=[TX_WITHDRAW, MERCHANT_ADDRESS, MERCHANT_AMOUNT])
        self.run(tx, self.contract)

        assert len(self.contract.txs) == 1
        assert self.contract.txs == [(MERCHANT_ADDRESS, MERCHANT_AMOUNT, 0, 0)]

    def test_divorce_request(self):
        tx = Tx(sender=PARTNER_1, value=100, data=[TX_DIVORCE])
        self.run(tx, self.contract)

        assert self.contract.storage[I_DIVORCE_CREATOR] == PARTNER_1

    def test_divorce_approval(self):
        tx = Tx(sender=PARTNER_2, value=100, data=[TX_DIVORCE])

        block = Block()
        block.set_account_balance('myaddress', 1000)
        self.run(tx, self.contract, block)

        assert self.contract.storage[I_STATE] == S_DIVORCED
        assert len(self.contract.txs) == 2
        assert self.contract.txs == [(PARTNER_1, 500, 0, 0), (PARTNER_2, 500, 0, 0)]

    def test_withdraw_after_divorce_fails(self):
        tx = Tx(sender=PARTNER_1, value=100, data=[TX_WITHDRAW, MERCHANT_ADDRESS, MERCHANT_AMOUNT])
        self.run(tx, self.contract)

        assert self.contract.storage[I_WITHDRAW_TO] == 0
        assert self.contract.storage[I_WITHDRAW_AMOUNT] == 0
        assert self.contract.storage[I_WITHDRAW_CREATOR] == 0
