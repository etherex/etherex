import sys
sys.path.insert(0, './evm-sim/tests')
from sim import Key, Simulator, load_serpent

class TestEtherEx(object):

    ALICE = Key('alice')
    BOB = Key('bob')
    CHARLIE = Key('charlie')

    @classmethod
    def setup_class(cls):
        cls.code = load_serpent('contracts/etherex.ser')
        cls.bcode = load_serpent('contracts/balances.ser')
        cls.icode = load_serpent('contracts/indexes.ser')
        cls.tcode = load_serpent('contracts/trades.ser')
        cls.ccode = load_serpent('contracts/currencies.ser')
        cls.sim = Simulator({cls.ALICE.address: 10**24,
                             cls.BOB.address: 10**24})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code, 0, 100000)
        self.bcontract = self.sim.load_contract(self.ALICE, self.bcode)
        self.icontract = self.sim.load_contract(self.ALICE, self.icode)
        self.tcontract = self.sim.load_contract(self.ALICE, self.tcode)
        self.ccontract = self.sim.load_contract(self.ALICE, self.ccode)

    def test_creation(self):
        assert self.sim.get_storage_data(self.contract, 2) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.bcontract, 2) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.icontract, 2) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.tcontract, 2) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.ccontract, 2) == int(self.ALICE.address, 16)

    def test_initialize(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, [self.bcontract, self.icontract, self.tcontract, self.ccontract])
        ans = self.sim.tx(self.ALICE, self.bcontract, 10**18, [self.contract])
        ans = self.sim.tx(self.ALICE, self.icontract, 0, [self.contract])
        ans = self.sim.tx(self.ALICE, self.tcontract, 0, [self.contract])
        ans = self.sim.tx(self.ALICE, self.ccontract, 0, [self.contract])
        assert self.sim.get_storage_data(self.contract, 3) == int(self.bcontract, 16)
        assert self.sim.get_storage_data(self.contract, 4) == int(self.icontract, 16)
        assert self.sim.get_storage_data(self.contract, 5) == int(self.tcontract, 16)
        assert self.sim.get_storage_data(self.contract, 6) == int(self.ccontract, 16)
        assert self.sim.get_storage_data(self.bcontract, "b5b8c62dd5a20793b6c562e002e7e0aa68316d31") == 333333333333333333
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 10 ** 18
        assert self.sim.get_storage_data(self.bcontract, 2) == int(self.contract, 16)
        assert self.sim.get_storage_data(self.icontract, 2) == int(self.contract, 16)
        assert self.sim.get_storage_data(self.tcontract, 2) == int(self.contract, 16)
        assert self.sim.get_storage_data(self.ccontract, 2) == int(self.contract, 16)

    def test_alice_to_bob(self):
        ans = self.sim.tx(self.ALICE, self.bcontract, 0, [self.BOB.address, 1000])
        assert ans == [1]
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 999000
        assert self.sim.get_storage_data(self.bcontract, self.BOB.address) == 0

    def test_bob_to_charlie_invalid(self):
        ans = self.sim.tx(self.BOB, self.contract, 0, [self.CHARLIE.address, 1000])
        assert ans == [0]
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 999000
        assert self.sim.get_storage_data(self.bcontract, self.BOB.address) == 0
        assert self.sim.get_storage_data(self.bcontract, self.CHARLIE.address) == 0

    def test_alice_to_bob_to_charlie_valid(self):
        ans = self.sim.tx(self.ALICE, self.bcontract, 0, [self.BOB.address, 1000])
        assert ans == [1]

        ans = self.sim.tx(self.BOB, self.bcontract, 0, [self.CHARLIE.address, 250])
        assert ans == [1]

        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 999000
        assert self.sim.get_storage_data(self.bcontract, self.BOB.address) == 750
        assert self.sim.get_storage_data(self.bcontract, self.CHARLIE.address) == 250
