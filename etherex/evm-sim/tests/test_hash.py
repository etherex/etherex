from sim import Key, Simulator, compile_serpent
from pyethereum.utils import sha3, big_endian_to_int, zpad


class TestHash(object):

    ALICE = Key('cow')

    @classmethod
    def setup_class(cls):
        cls.code = compile_serpent('examples/hash.se')
        cls.sim = Simulator({cls.ALICE.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code)

    def get_proposal_id(self, proposal):
        return big_endian_to_int(sha3(zpad(proposal, 32)))

    def test_hash(self):
        proposal_id_bob = self.get_proposal_id("grant to bob")
        assert proposal_id_bob == 82884732143192300288868108433691753839884641754571232824914642588078699974444

        ans = self.sim.tx(self.ALICE, self.contract, 0, ["hash", "grant to bob"])
        assert ans == [proposal_id_bob]
