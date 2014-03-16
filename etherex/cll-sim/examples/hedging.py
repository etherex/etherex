from sim import Block, Contract, Simulation, Tx, log, mktx, stop

class FinancialDerivative(Contract):
    """Financial derivatives contract example from https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-White-Paper#wiki-financial-derivatives"""

    def run(self, tx, contract, block):
        if tx.value < 200 * block.basefee:
            stop("Insufficient fee")
        if contract.storage[1000] == 0:
            if tx.value < 1000 * 10 ** 18:
                stop("Insufficient value")
            contract.storage[1000] = 1  # XXX Bug in contract example flag should be set
            contract.storage[1001] = 998 * block.contract_storage(D)[I]
            contract.storage[1002] = block.timestamp + 30 * 86400
            contract.storage[1003] = tx.sender
            log("Contract initialized")
        else:
            ethervalue = contract.storage[1001] / block.contract_storage(D)[I]
            log("Ether Value = %s" % ethervalue)
            if ethervalue >= 5000:  # XXX Bug in contract example, value shouldn't be times 10 ** 18
                mktx(contract.storage[1003], 5000 * 10 ** 18, 0, 0)
            elif block.timestamp > contract.storage[1002]:
                # XXX Bug in contract example, values should be times 10 ** 18
                mktx(contract.storage[1003], ethervalue * 10 ** 18, 0, 0)
                mktx(A, (5000 - ethervalue) * 10 ** 18, 0, 0)


class HedgingRun(Simulation):

    contract = FinancialDerivative(A="alice", D="datafeed", I="USD")
    ts_zero = 1392632520

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
        block.contract_storage(self.contract.D)[self.contract.I] = 2500
        tx = Tx(sender='bob', value=1000 * 10 ** 18)
        self.run(tx, self.contract, block)
        assert self.contract.storage[1000] == 1
        assert self.contract.storage[1001] == 2495000
        assert self.contract.storage[1002] == self.ts_zero + 30 * 86400
        assert self.contract.storage[1003] == tx.sender
        assert len(self.contract.txs) == 0

    def test_ether_drops(self):
        block = Block(timestamp=self.ts_zero + 30 * 86400 + 1)
        block.contract_storage(self.contract.D)[self.contract.I] = 400
        tx = Tx(sender='bob', value=200)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 1
        assert self.contract.txs == [('bob', 5000 * 10 ** 18, 0, 0)]

    def test_ether_rises(self):
        block = Block(timestamp=self.ts_zero + 30 * 86400 + 1)
        block.contract_storage(self.contract.D)[self.contract.I] = 4000
        tx = Tx(sender='bob', value=200)
        self.run(tx, self.contract, block)
        assert len(self.contract.txs) == 2
        assert self.contract.txs == [('bob', 623 * 10 ** 18, 0, 0), ('alice', 4377 * 10 ** 18, 0, 0)]
