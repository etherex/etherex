from sim import Block, Contract, Simulation, Tx, mktx, stop

class Fountain(Contract):
    """Fountain example to demonstrate block.account_balance"""

    def run(self, tx, contract, block):
        if tx.value < 1000 * block.basefee:
            stop("Insufficient fee")
        to = tx.data[0]
        value = tx.value - 1000 * block.basefee
        if block.account_balance(to) == 0:
            mktx(to, value, 0, 0)
        else:
            mktx(tx.sender, value, 0, 0)


class FountainRun(Simulation):

    contract = Fountain()

    def test_insufficient_fee(self):
        tx = Tx(sender='alice', value=10)
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient fee'

    def test_recipient_has_no_balance(self):
        tx = Tx(sender='alice', value=2000, data=['bob'])
        block = Block()
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 1
        assert self.contract.txs == [('bob', 1000, 0, 0)]

    def test_recipient_has_balance(self):
        tx = Tx(sender='alice', value=2000, data=['bob'])
        block = Block()
        block.set_account_balance('bob', 1000)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 1
        assert self.contract.txs == [('alice', 1000, 0, 0)]
