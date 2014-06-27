from sim import Key, Simulator, compile_serpent


class TestReturnTen(object):

    ALICE = Key('cow')

    @classmethod
    def setup_class(cls):
        cls.code = compile_serpent('examples/returnten.se')
        cls.sim = Simulator({cls.ALICE.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code)

    def test_returnten(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, [])
        assert ans == [10]
