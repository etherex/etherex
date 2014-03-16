from sim import Block, Contract, Tx, Simulation, log, mktx, stop

class EqualSharesWithdrawals(Contract):
    """Equal shares withdrawals example contract"""

    def run(self, tx, contract, block):
        participants = 3
        k = 1000

        if tx.value < block.basefee * 200:
            stop("Insufficient fee")
        if contract.storage[k] == 0:
            if tx.value < 1000 * 10 ** 18:
                stop("Insufficient value")
        if contract.storage[k + contract.storage[k + participants + 1]] == 0 and contract.storage[k + participants + 1] < participants:
            if tx.value < 1100 * 10 ** 18:
                stop("Insufficient fee for storage")
            contract.storage[k + contract.storage[k + participants + 1]] = 1
            contract.storage[k + participants] += tx.value - block.basefee * 200
            contract.storage[k + participants + 1] += 1
            log(tx.sender + " is in.")
        elif tx.value >= 1100 * 10 ** 18 and contract.storage[k + 4] == 3:
            contract.storage[k + participants] += tx.value - block.basefee * 200
            log(tx.sender + " added " + str(tx.value))
        elif tx.value <= 1000 * 10 ** 18:
            if contract.storage[k + 3] < tx.value * 3:
                stop("Insufficient funds for withdrawal")

            mktx(A, contract.storage[k + 3] / 30, 0, 0)
            mktx(B, contract.storage[k + 3] / 30, 0, 0)
            mktx(C, contract.storage[k + 3] / 30, 0, 0)

            contract.storage[k + 3] -= (contract.storage[k + 3] / 30) * 3


class EqualSharesWithdrawalsRun(Simulation):

    contract = EqualSharesWithdrawals(A="alice", B="bob", C="charles", D="dao")
    ts_zero = 1392632520
    deposit = 2000 * 10 ** 18

    def test_insufficient_fee(self):
        tx = Tx(sender='alice', value=10)
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient fee'

    def test_insufficient_value(self):
        tx = Tx(sender='alice', value=1000)
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient value'
        assert self.contract.storage[1000] == 0

    def test_creation(self):
        block = Block(timestamp=self.ts_zero)
        tx = Tx(sender='alice', value=self.deposit)
        self.run(tx, self.contract, block)
        tx = Tx(sender='bob', value=self.deposit)
        self.run(tx, self.contract, block)
        tx = Tx(sender='charles', value=self.deposit)
        self.run(tx, self.contract, block)
        assert self.contract.storage[1000] == 1
        assert self.contract.storage[1001] == 1
        assert self.contract.storage[1002] == 1
        assert self.contract.storage[1003] == (self.deposit * 3) - ((block.basefee * 200) * 3)
        assert len(self.contract.txs) == 0

    def test_one_withdraws(self):
        block = Block(timestamp=self.ts_zero + 15 * 86400 + 1)
        block.contract_storage(self.contract.D)[self.contract.D] = 100000 * 10 ** 18
        tx = Tx(sender='alice', value=1000)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 3
        assert self.contract.txs == [('alice', 199999999999999999980, 0, 0), ('bob', 199999999999999999980, 0, 0), ('charles', 199999999999999999980, 0, 0)]

    def test_one_deposits(self):
        block = Block(timestamp=self.ts_zero + 30 * 86400 + 1)
        block.contract_storage(self.contract.D)[self.contract.D] = 100000 * 10 ** 18
        tx = Tx(sender='alice', value=1200 * 10 ** 18)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 0

    def test_two_withdraws(self):
        block = Block(timestamp=self.ts_zero + 31 * 86400 + 1)
        block.contract_storage(self.contract.D)[self.contract.D] = 100000 * 10 ** 18
        tx = Tx(sender='alice', value=1000)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 3
        assert self.contract.txs == [('alice', 219999999999999999975, 0, 0), ('bob', 219999999999999999975, 0, 0), ('charles', 219999999999999999975, 0, 0)]
        tx = Tx(sender='bob', value=1000)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 3
        assert self.contract.txs == [('alice', 197999999999999999977, 0, 0), ('bob', 197999999999999999977, 0, 0), ('charles', 197999999999999999977, 0, 0)]
