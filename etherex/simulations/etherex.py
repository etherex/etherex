from sim import Block, Contract, Simulation, Tx
# import time

class EtherEx(Contract):
    """EtherEx contract"""

    def run(self, tx, contract, block):
        hll = "contracts/etherex.ser"
        Contract.load(self, hll, tx, contract, block)

class Balances(Contract):
    """Balances contract"""

    def run(self, tx, contract, block):
        hll = "contracts/balances.ser"
        Contract.load(self, hll, tx, contract, block)

class Xeth(Contract):
    """Xeth contract"""

    def run(self, tx, contract, block):
        hll = "contracts/xeth.ser"
        Contract.load(self, hll, tx, contract, block)

class EtherExRun(Simulation):

    xeth = Xeth(CAK="caktux", EOAR="eoar", FAB="fabrezio")
    contract = EtherEx(CAK="caktux", EOAR="eoar", FAB="fabrezio", XETH=xeth.address)
    balances = Balances(EX=contract.address)
    etherex = int(contract.address, 16)
    # ts = time.time()
    print 20 * "="

    # XETH
    def test_xeth_creation(self):
        tx = Tx(sender='caktux', value=1 * 10 ** 18, data=[0])
        self.run(tx, self.xeth)
        print 20 * "="

    # EtherEx
    def test_insufficient_gas(self):
        # block = Block(timestamp=self.ts + 15 * 86400 + 1)
        tx = Tx(sender='caktux', value=0, gas=10, data=[0])
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient gas'
        assert self.contract.storage[1] == 0

    def test_creation(self):
        tx = Tx(sender='caktux', value=3000 * 10 ** 21, data=[0])
        self.run(tx, self.contract)
        # print self.contract.txs
        # assert len(self.contract.txs) == 2
        assert self.contract.storage[1] == 1
        # assert self.contract.storage[2] == ['EtherEx']
        assert self.stopped.startswith('EtherEx initialized')

    def test_change_ownership(self):
        tx = Tx(sender='caktux', value=0, data=[9, 0xf9e57456f18d90886263fedd9cc30b27cd959137])
        self.run(tx, self.contract)
        print 20 * "="

    # - Balances
    def test_balances_creation(self):
        tx = Tx(sender=self.etherex, value=1 * 10 ** 18, data=[self.etherex])
        self.run(tx, self.balances)
        print 20 * "="

    # - XETH
    def test_check_xeth_balance(self):
        tx = Tx(sender=self.etherex, value=0, data=[self.etherex, 0, 1])
        self.run(tx, self.xeth)

    def test_transfer_eth_to_xeth(self):
        tx = Tx(sender=self.etherex, value=1 * 10 ** 17, data=[self.etherex, 0])
        self.run(tx, self.xeth)

    def test_transfer_xeth_to_caktux(self):
        tx = Tx(sender=self.etherex, value=0, data=[0x63616b747578, 1000])
        self.run(tx, self.xeth)

    def test_transfer_xeth_to_eoar(self):
        tx = Tx(sender=self.etherex, value=0, data=[0x656f6172, 1000])
        self.run(tx, self.xeth)

    def test_transfer_xeth_to_fabrezio(self):
        tx = Tx(sender=self.etherex, value=0, data=[0x66616272657a696f, 1000])
        self.run(tx, self.xeth)
        print 20 * "="

    def test_xeth_ownership(self):
        tx = Tx(sender=self.etherex, value=0, data=[0x656f6172, 0, 3])
        self.run(tx, self.xeth)
        print 20 * "="

    # EtherEx
    def test_no_data(self):
        tx = Tx(sender='eoar', value=0)
        self.run(tx, self.contract)
        assert self.stopped.startswith("No data")

    def test_invalid_operation(self):
        tx = Tx(sender='eoar', value=0, data=[0, 0])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid operation"

    def test_missing_amount(self):
        tx = Tx(sender='eoar', value=0, data=[1])
        self.run(tx, self.contract)
        assert self.stopped == "Missing amount"

    def test_invalid_amount(self):
        tx = Tx(sender='eoar', value=0, data=[1, 0])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid amount"

    def test_missing_price(self):
        tx = Tx(sender='eoar', value=0, data=[1, 1])
        self.run(tx, self.contract)
        assert self.stopped == "Missing price"

    def test_invalid_price(self):
        tx = Tx(sender='eoar', value=0, data=[1, 1, 0])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid price"

    def test_missing_market_id(self):
        tx = Tx(sender='eoar', value=0, data=[1, 1, 1])
        self.run(tx, self.contract)
        assert self.stopped == "Missing market ID"

    def test_missing_market_id(self):
        tx = Tx(sender='eoar', value=0, data=[1, 1, 1 * 10 ** 8, 2])
        self.run(tx, self.contract)
        assert self.stopped == "Invalid market ID"

    def test_too_many_arguments(self):
        tx = Tx(sender='eoar', value=0, data=[1, 1000 * 10 ** 21, 1 * 10 ** 8, 1, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Too many arguments")

    def test_amount_out_of_range(self):
        tx = Tx(sender='eoar', value=0, data=[1, 2**256+1, 1 * 10 ** 8, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Amount out of range")

    def test_price_out_of_range(self):
        tx = Tx(sender='eoar', value=0, data=[1, 1 * 10 ** 8, 256**256+1, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Price out of range")

    def test_insufficient_btc_trade(self):
        tx = Tx(sender='caktux', value=0, data=[1, 1 * 10 ** 6, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Minimum BTC trade amount not met")
        assert self.contract.storage[1] == 1

    def test_insufficient_eth_trade(self):
        tx = Tx(sender='caktux', value=0, data=[2, 1 * 10 ** 18, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Minimum ETH trade amount not met")
        assert self.contract.storage[1] == 1

    def test_insufficient_eth(self):
        tx = Tx(sender='caktux', value=1 * 10 ** 18, data=[2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)
        assert self.stopped.startswith("Minimum ETH value not met")
        assert self.contract.storage[1] == 1

    def test_first_sell(self):
        tx = Tx(sender="caktux", value=1 * 10 ** 21, data=[2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_second_sell(self):
        tx = Tx(sender="eoar", value=1 * 10 ** 21, data=[2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_first_buy(self):
        tx = Tx(sender="fabrezio", value=0, data=[1, 1 * 10 ** 21, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_second_buy_with_leftover(self):
        tx = Tx(sender='caktux', value=0, data=[1, 1500 * 10 ** 18, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_bigger_sell(self):
        tx = Tx(sender='eoar', value=1500 * 10 ** 18, data=[2, 1500 * 10 ** 18, 1200 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_bigger_buy_but_less(self):
        tx = Tx(sender='caktux', value=1200 * 10 ** 18, data=[1, 1200 * 10 ** 18, 1200 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_other_amount(self):
        tx = Tx(sender='fabrezio', value=4200 * 10 ** 18, data=[1, 4000 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_twice_that_amount(self):
        tx = Tx(sender='eoar', value=8000 * 10 ** 21, data=[2, 8000 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_another_buy_at_that_price(self):
        tx = Tx(sender='fabrezio', value=5000 * 10 ** 18, data=[1, 4500 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_lower_cross_index_check(self):
        tx = Tx(sender='eoar', value=20000 * 10 ** 18, data=[2, 20000 * 10 ** 18, 900 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_buy_lower_cross_index_fail(self):
        tx = Tx(sender='fabrezio', value=2500 * 10 ** 18, data=[1, 2500 * 10 ** 18, 900 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_sell_back_at_first_price(self):
        tx = Tx(sender='eoar', value=2500 * 10 ** 18, data=[2, 500 * 10 ** 18, 1000 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_index_replacing(self):
        tx = Tx(sender='fabrezio', value=2500 * 10 ** 18, data=[2, 2500 * 10 ** 18, 950 * 10 ** 8, 1])
        self.run(tx, self.contract)
        # assert self.contract.storage[5003] == [[4, [[1, 95000000000]], [1, 120000000000], [1, 110000000000], [1, 90000000000]], [0]]

    def test_other_amount_again(self):
        tx = Tx(sender='caktux', value=2500 * 10 ** 18, data=[1, 2500 * 10 ** 18, 1100 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_whale_sell(self):
        tx = Tx(sender='eoar', value=5 * 10 ** 28, data=[2, 5 * 10 ** 28, 800 * 10 ** 8, 1])
        self.run(tx, self.contract)

    def test_whale_buy(self):
        tx = Tx(sender='eoar', value=0, data=[1, 10 * 10 ** 28, 1500 * 10 ** 8, 1])
        self.run(tx, self.contract)


    # def test_sell_seventh(self):
    #     tx = Tx(sender='caktux', value=5000 * 10 ** 18, data=[2, 5000 * 10 ** 18, 1100 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    def test_results(self):
        self.log(self.contract.balance)
        self.log(self.contract.storage)
        self.log(self.xeth.balance)
        self.log(self.xeth.storage)
        self.log(self.balances.balance)
        self.log(self.balances.storage)
