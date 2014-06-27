from sim import Key, Simulator, compile_serpent


class TestSubcurrency(object):

    ALICE = Key('cow')
    BOB = Key('cat')
    CHARLIE = Key('car')

    @classmethod
    def setup_class(cls):
        cls.code = compile_serpent('examples/subcurrency.se')
        cls.sim = Simulator({cls.ALICE.address: 10**18,
                             cls.BOB.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code)

    def test_creation(self):
        assert self.sim.get_storage_data(self.contract, self.ALICE.address) == 1000000

    def test_alice_to_bob(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, [self.BOB.address, 1000])
        assert ans == [1]
        assert self.sim.get_storage_data(self.contract, self.ALICE.address) == 999000
        assert self.sim.get_storage_data(self.contract, self.BOB.address) == 1000

    def test_bob_to_charlie_invalid(self):
        ans = self.sim.tx(self.BOB, self.contract, 0, [self.CHARLIE.address, 1000])
        assert ans == [0]
        assert self.sim.get_storage_data(self.contract, self.ALICE.address) == 1000000
        assert self.sim.get_storage_data(self.contract, self.BOB.address) == 0
        assert self.sim.get_storage_data(self.contract, self.CHARLIE.address) == 0

    def test_alice_to_bob_to_charlie_valid(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, [self.BOB.address, 1000])
        assert ans == [1]

        ans = self.sim.tx(self.BOB, self.contract, 0, [self.CHARLIE.address, 250])
        assert ans == [1]

        assert self.sim.get_storage_data(self.contract, self.ALICE.address) == 999000
        assert self.sim.get_storage_data(self.contract, self.BOB.address) == 750
        assert self.sim.get_storage_data(self.contract, self.CHARLIE.address) == 250
