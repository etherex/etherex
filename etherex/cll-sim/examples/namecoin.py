from sim import Contract, Simulation, Tx, stop

class Namecoin(Contract):
    """Namecoin contract example from https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-White-Paper#wiki-identity-and-reputation-systems"""

    def run(self, tx, contract, block):
        if tx.value < block.basefee * 200:
            stop("Insufficient fee")
        if contract.storage[tx.data[0]] or tx.data[0] < 100:
            stop("Key already reserved")
        contract.storage[tx.data[0]] = tx.data[1]


class NamecoinRun(Simulation):

    contract = Namecoin()

    def test_insufficient_fee(self):
        tx = Tx(sender='alice', value=10)
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient fee'

    def test_reservation(self):
        tx = Tx(sender='alice', value=200, data=['ethereum.bit', '54.200.236.204'])
        self.run(tx, self.contract)
        assert self.contract.storage['ethereum.bit'] == '54.200.236.204'

    def test_double_reservation(self):
        tx = Tx(sender='alice', value=200, data=['ethereum.bit', '127.0.0.1'])
        self.run(tx, self.contract)
        assert self.stopped == 'Key already reserved'
        assert self.contract.storage['ethereum.bit'] == '54.200.236.204'
