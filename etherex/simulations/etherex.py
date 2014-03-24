from sim import Block, Contract, Simulation, Tx, log, mktx, stop
# from etherexrun import Hll
# import etherexrun

class EtherEx(Contract):
    """EtherEx contract"""

    def run(self, tx, contract, block): # pass
        hll = "contracts/etherex.cll"
        Contract.load(self, hll, tx, contract, block)

    #     if tx.value < 1000 * block.basefee:
    #         stop("Insufficient fee")
    #     status = contract.storage[1000]
    #     if status == 0:
    #         contract.storage[1001] = [self.C, self.E, self.F] # [0xcaktux, 0xeoar, 0xfabrezio]
    #         contract.storage[1000] = 1
    #         stop("Exchange initialized")
    #     # arrays and strings...
    #     ops = ["BUY", "SELL", "DEPOSIT", "WITHDRAW", "CANCEL"]
    #     markets = ["ETH/BTC"]
    #     if tx.data[0] == 0:
    #         stop("Nothing to do")
    #     cm = 1
    #     while cm > 0:
    #         if cm == 1:
    #             if tx.data[0] == 1 and tx.data[1] < 1 * 10 ** 7:
    #                 stop("Insufficient BTC")
    #             if tx.data[0] == 2 and tx.value < 1 * 10 ** 21:
    #                 stop("Insufficient ETH")
    #         cm = cm - 1
    #     if tx.data[0] == 1:
    #         stop("Buying")
    #     elif tx.data[0] == 2:
    #         stop("Selling")
    #     elif tx.data[0] == 3:
    #         stop("Deposit")
    #     elif tx.data[0] == 4:
    #         stop("Withdraw")
    #     elif tx.data[0] == 5:
    #         stop("Cancel")


class EtherExRun(Simulation):

    contract = EtherEx(C="caktux", E="eoar", F="fabrezio") #, D="data") #, B="buy", S="sell") # , O="owner")
    ts_zero = 1392632520

    def test_insufficient_fee(self):
        tx = Tx(sender='caktux', value=10, data=[0])
        self.run(tx, self.contract)
        # assert self.stopped == 'Insufficient fee'
        assert self.contract.storage[1000] == 0

    def test_creation(self):
        block = Block(timestamp=self.ts_zero)
        tx = Tx(sender='caktux', value=1 * 10 ** 18, data=[0])
        self.run(tx, self.contract, block)
        # tx = Tx(sender='eoar', value=1 * 10 ** 18)
        # self.run(tx, self.contract, block)
        # tx = Tx(sender='fabrezio', value=1 * 10 ** 18)
        # self.run(tx, self.contract, block)

        assert self.contract.storage[1000] == 1
        # assert self.contract.storage[1001] == 2495000
        # assert self.contract.storage[1002] == self.ts_zero + 30 * 86400
        # assert self.contract.storage[1003] == tx.sender
        # assert len(self.contract.txs) == 0
        # assert self.stopped == 'Exchange initialized'

    def test_insufficient_btc(self):
        tx = Tx(sender='caktux', value=1000, data=[1, 1 * 10 ** 6])
        self.run(tx, self.contract)
        # assert self.stopped == 'Insufficient BTC'
        # assert self.stopped == 'line 24'
        assert self.contract.storage[1000] == 1

    def test_insufficient_eth(self):
        tx = Tx(sender='caktux', value=1000, data=[2, 1 * 10 ** 20])
        self.run(tx, self.contract)
        # assert self.stopped == 'Insufficient ETH'
        assert self.contract.storage[1000] == 1

    def test_sell_first(self):
        tx = Tx(sender="caktux", value=1 * 10 ** 21, data=[2, 1 * 10 ** 21])
        self.run(tx, self.contract)
        # assert self.contract.storage[1003] == 1 * 10 ** 21, "sell not recorded: %s" % self.contract.storage[1003]

    def test_sell_second(self):
        tx = Tx(sender="eoar", value=1 * 10 ** 21, data=[2, 1 * 10 ** 21])
        self.run(tx, self.contract)
        # assert self.contract.storage[1003] == 2 * 10 ** 21, "sell not recorded: %s" % self.contract.storage[1003]

    def test_buy_first(self):
        tx = Tx(sender="fabrezio", value=1000, data=[1, 1 * 10 ** 21])
        self.run(tx, self.contract)
        # assert self.contract.storage[1002] == 1 * 10 ** 21, "buy not recorded: %s" % self.contract.storage[1003]

    # def test_sell_one(self):
    #     block = Block(timestamp=self.ts_zero + 10 * 86400 + 1)
    #     tx = Tx(sender='caktux', value=1500 * 10 ** 18, data=[0, 1500 * 10 ** 18, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.S] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)
    #     # assert len(self.contract.txs) == 1
    #     # assert self.contract.txs == [('bob', 5000 * 10 ** 18, 0, 0)]

    # def test_buy_one(self):
    #     block = Block(timestamp=self.ts_zero + 15 * 86400 + 1)
    #     tx = Tx(sender='eoar', value=1200 * 10 ** 18, data=[1200 * 10 ** 18, 0, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)

    # def test_buy_two(self):
    #     block = Block(timestamp=self.ts_zero + 20 * 86400 + 1)
    #     tx = Tx(sender='fabrezio', value=4200 * 10 ** 18, data=[4200 * 10 ** 18, 0, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)
    #     # assert len(self.contract.txs) == 2
    #     # assert self.contract.txs == [('bob', 623 * 10 ** 18, 0, 0), ('alice', 4377 * 10 ** 18, 0, 0)]

    # def test_sell_two(self):
    #     block = Block(timestamp=self.ts_zero + 25 * 86400 + 1)
    #     tx = Tx(sender='eoar', value=8000 * 10 ** 21, data=[0, 8000 * 10 ** 18, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.S] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)

    # def test_buy_three(self):
    #     block = Block(timestamp=self.ts_zero + 26 * 86400 + 1)
    #     tx = Tx(sender='fabrezio', value=5000 * 10 ** 18, data=[5000 * 10 ** 18, 0, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)

    # def test_sell_three(self):
    #     block = Block(timestamp=self.ts_zero + 28 * 86400 + 1)
    #     tx = Tx(sender='eoar', value=20000 * 10 ** 18, data=[0, 20000 * 10 ** 18, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.S] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)

    # def test_buy_four(self):
    #     block = Block(timestamp=self.ts_zero + 30 * 86400 + 1)
    #     tx = Tx(sender='fabrezio', value=2500 * 10 ** 18, data=[2500 * 10 ** 18, 0, 0])
    #     # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
    #     # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
    #     self.run(tx, self.contract, block)

    def test_storage_result(self):
        self.log(self.contract.storage)
