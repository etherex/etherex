from sim import Key, Simulator, compile_serpent

from pyethereum import utils


class TestDatafeed(object):

    ALICE = Key('cow')

    @classmethod
    def setup_class(cls):
        cls.code = compile_serpent('examples/datafeed.se')
        cls.sim = Simulator({cls.ALICE.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code)

    def test_store_single(self):
        data = ['key', 'value']
        ans = self.sim.tx(self.ALICE, self.contract, 0, data)
        assert ans == [1]
        storage = self.sim.get_storage_dict(self.contract)
        assert storage.get(utils.zpad('key', 32)) == 'value'

    def test_store_multiple(self):
        data = ['key1', 'value1', 'key2', 'value2']
        ans = self.sim.tx(self.ALICE, self.contract, 0, data)
        assert ans == [1]
        storage = self.sim.get_storage_dict(self.contract)
        assert storage.get(utils.zpad('key1', 32)) == 'value1'
        assert storage.get(utils.zpad('key2', 32)) == 'value2'
