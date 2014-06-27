from sim import Key, Simulator, compile_serpent


class TestNamecoin(object):

    ALICE = Key('cow')

    @classmethod
    def setup_class(cls):
        cls.code = compile_serpent('examples/namecoin.se')
        cls.sim = Simulator({cls.ALICE.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code)

    def test_reservation(self):
        data = ['ethereum.bit', '54.200.236.204']
        ans = self.sim.tx(self.ALICE, self.contract, 0, data)

        assert ans == [1]
        assert self.sim.get_storage_dict(self.contract) == {'ethereum.bit': '54.200.236.204'}

    def test_double_reservation(self):
        data = ['ethereum.bit', '127.0.0.1']
        ans = self.sim.tx(self.ALICE, self.contract, 0, data)
        assert ans == [1]

        data = ['ethereum.bit', '127.0.0.2']
        ans = self.sim.tx(self.ALICE, self.contract, 0, data)
        assert ans == [0]
        assert self.sim.get_storage_dict(self.contract) == {'ethereum.bit': '127.0.0.1'}
