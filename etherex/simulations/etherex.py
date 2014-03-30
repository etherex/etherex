from sim import Block, Contract, Simulation, Tx, log, mkcall, stop
# import time

class EtherEx(Contract):
    """EtherEx contract"""

    def run(self, tx, contract, block):
        hll = "contracts/etherex.cll"
        Contract.load(self, hll, tx, contract, block)


class EtherExRun(Simulation):

    contract = EtherEx(CAK="caktux", EOAR="eoar", FAB="fabrezio")
    # ts = time.time()

    def test_insufficient_fee(self):
        # block = Block(timestamp=self.ts + 15 * 86400 + 1)
        tx = Tx(sender='caktux', value=10, data=[0])
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient fee'
        assert self.contract.storage[5000] == 0

    def test_creation(self):
        tx = Tx(sender='caktux', value=3000 * 10 ** 21, data=[0])
        self.run(tx, self.contract)
        # assert len(self.contract.txs) == 0
        assert self.contract.storage[5000] == 1
        assert self.contract.storage[5001] == ['caktux', 'eoar', 'fabrezio']
        assert self.stopped == 'EtherEx initialized'

    def test_insufficient_btc(self):
        tx = Tx(sender='caktux', value=1000, data=[1, 1 * 10 ** 6, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Minimum BTC trade amount not met")
        assert self.contract.storage[5000] == 1

    def test_insufficient_eth(self):
        tx = Tx(sender='caktux', value=1000, data=[2, 1 * 10 ** 20, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Minimum ETH trade amount not met")
        assert self.contract.storage[5000] == 1

    def test_no_data(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21)
        self.run(tx, self.contract)
        assert self.stopped.startswith("No data")

    def test_invalid_operation(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[0, 0])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid operation"

    def test_missing_amount(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1])
        self.run(tx, self.contract)
        assert self.stopped == "Missing amount"

    def test_invalid_amount(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1, 0])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid amount"

    def test_missing_price(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1, 1])
        self.run(tx, self.contract)
        assert self.stopped == "Missing price"

    def test_invalid_price(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1, 1, 0])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid price"

    def test_missing_market_id(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1, 1, 1])
        self.run(tx, self.contract)
        assert self.stopped == "Missing market ID"

    def test_missing_market_id(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1, 1, 1 * 10 ** 8, 2])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid market ID"

    def test_out_of_range(self):
        tx = Tx(sender='eoar', value=1000 * 10 ** 21, data=[1, 1000 * 10 ** 21, 256**256+1, 1])
        self.run(tx, self.contract)
        assert self.stopped.endswith("out of range")

    def test_sell_first(self):
        tx = Tx(sender="caktux", value=1 * 10 ** 21, data=[2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_second(self):
        tx = Tx(sender="eoar", value=1 * 10 ** 21, data=[2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_first(self):
        tx = Tx(sender="fabrezio", value=1000, data=[1, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_second(self):
        tx = Tx(sender='caktux', value=1500 * 10 ** 18, data=[1, 1500 * 10 ** 18, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_third(self):
        tx = Tx(sender='eoar', value=1500 * 10 ** 18, data=[2, 1500 * 10 ** 18, 1200 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_fourth(self):
        tx = Tx(sender='eoar', value=1200 * 10 ** 18, data=[1, 1200 * 10 ** 18, 1200 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_fifth(self):
        tx = Tx(sender='fabrezio', value=4200 * 10 ** 18, data=[1, 4000 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_fourth(self):
        tx = Tx(sender='eoar', value=8000 * 10 ** 21, data=[2, 8000 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_sixth(self):
        tx = Tx(sender='fabrezio', value=5000 * 10 ** 18, data=[1, 4500 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_fifth(self):
        tx = Tx(sender='eoar', value=20000 * 10 ** 18, data=[2, 20000 * 10 ** 18, 900 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_seventh(self):
        tx = Tx(sender='fabrezio', value=2500 * 10 ** 18, data=[1, 2500 * 10 ** 18, 900 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_storage_result(self):
        self.log(self.contract.storage)
