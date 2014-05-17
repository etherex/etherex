from sim import Key, Simulator, load_serpent


class TestReturnTen(object):

    ALICE = Key('cow')

    @classmethod
    def setup_class(cls):
        cls.code = "610070515b525b61000c37f26000601f5561001a515b525b6100143961002e5861000e515b525b61000c37f26002600035025b525b54602052f2600060645c03f06000545b60005b54516020526020602060205b525b016001520360005255516005525460200103600060005360645c03f150535b525b54602052f2".decode('hex')
        cls.sim = Simulator({cls.ALICE.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code)

    def test_returnten(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, [])
        assert ans == [10]
