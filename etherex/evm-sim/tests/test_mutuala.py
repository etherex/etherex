from sim import Key, Simulator, compile_serpent
from pyethereum.utils import coerce_to_bytes, coerce_addr_to_hex, sha3, big_endian_to_int, zpad

import logging
import pytest


class ContractError(Exception):
    pass


def result(ans):
    if ans[0] != 0:
        # error
        if len(ans) > 1:
            raise ContractError(coerce_to_bytes(ans[1]))
        else:
            raise ContractError()
    else:
        return ans[1:]


class TestMutuala(object):

    ALICE = Key('cow')
    BOB = Key('cat')
    CHARLIE = Key('car')

    @classmethod
    def setup_class(cls):
        logging.disable(logging.INFO)  # disable overzealous DEBUG logging of pyethereum.processblock
        cls.code = compile_serpent('examples/mutuala.se')
        cls.sim = Simulator({cls.ALICE.address: 10**18,
                             cls.BOB.address: 10**18})

    def setup_method(self, method):
        self.sim.reset()
        self.contract = self.sim.load_contract(self.ALICE, self.code, gas=100000)

    def get_commons_balance(self):
        return self.sim.get_storage_data(self.contract, coerce_to_bytes(42))

    def get_account_balance(self, address):
        return self.sim.get_storage_data(self.contract, coerce_to_bytes(int(address, 16) + 2**161))

    def get_account_timestamp(self, address):
        return self.sim.get_storage_data(self.contract, coerce_to_bytes(int(address, 16) + 2**161 + 1))

    def get_account_tax_credits(self, address):
        return self.sim.get_storage_data(self.contract, coerce_to_bytes(int(address, 16) + 2**161 + 2))

    def get_account_list(self):
        nr_accounts = self.sim.get_storage_data(self.contract, coerce_to_bytes(2**160-1))
        accounts = []
        for idx in range(nr_accounts):
            accounts.append(coerce_addr_to_hex(self.sim.get_storage_data(self.contract, coerce_to_bytes(2**160 + idx))))
        return accounts

    def get_proposal_id(self, proposal):
        return big_endian_to_int(sha3(zpad(proposal, 32)))

    def get_proposal_recipient(self, proposal):
        proposal_id = self.get_proposal_id(proposal)
        return coerce_addr_to_hex(self.sim.get_storage_data(self.contract, coerce_to_bytes(proposal_id + 2**163)))

    def get_proposal_amount(self, proposal):
        proposal_id = self.get_proposal_id(proposal)
        return self.sim.get_storage_data(self.contract, coerce_to_bytes(proposal_id + 2**163 + 1))

    def get_proposal_votes(self, proposal):
        proposal_id = self.get_proposal_id(proposal)
        return self.sim.get_storage_data(self.contract, coerce_to_bytes(proposal_id + 2**163 + 2))

    def get_proposal_list(self):
        nr_proposals = self.sim.get_storage_data(self.contract, coerce_to_bytes(2**162-1))
        proposals = []
        for idx in range(nr_proposals):
            proposals.append(coerce_addr_to_hex(self.sim.get_storage_data(self.contract, coerce_to_bytes(2**162 + idx))))
        return proposals

    def test_creation(self):
        assert self.get_account_list() == [self.ALICE.address]
        assert self.get_account_balance(self.ALICE.address) == 10**12
        assert self.get_account_timestamp(self.ALICE.address) == 1388534400

    def test_alice_balance(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["balance", self.ALICE.address])
        assert result(ans) == [10**12]

    def test_alice_pay_to_bob(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []
        assert self.get_account_balance(self.ALICE.address) == 999999998950
        assert self.get_account_balance(self.BOB.address) == 1000

        # new account gets registered
        assert self.get_account_list() == [self.ALICE.address, self.BOB.address]
        assert self.get_account_timestamp(self.BOB.address) == 1388534400

        # payment tax added to commons account and tax credits
        assert self.get_commons_balance() == 50
        assert self.get_account_tax_credits(self.ALICE.address) == 50

        # make another payment
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []
        assert self.get_account_balance(self.ALICE.address) == 999999997900
        assert self.get_account_balance(self.BOB.address) == 2000

        # new account gets registered only once
        assert self.get_account_list() == [self.ALICE.address, self.BOB.address]

    def test_bob_to_charlie_invalid(self):
        ans = self.sim.tx(self.BOB, self.contract, 0, ["pay", self.CHARLIE.address, 1000])
        with pytest.raises(ContractError) as e:
            assert result(ans)
        assert e.value.message == "insufficient balance"

        assert self.get_account_balance(self.ALICE.address) == 10**12
        assert self.get_account_balance(self.BOB.address) == 0
        assert self.get_account_balance(self.CHARLIE.address) == 0

    def test_alice_to_bob_to_charlie_valid(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []

        ans = self.sim.tx(self.BOB, self.contract, 0, ["pay", self.CHARLIE.address, 250])
        assert result(ans) == []

        assert self.get_account_balance(self.ALICE.address) == 999999998950
        assert self.get_account_balance(self.BOB.address) == 738
        assert self.get_account_balance(self.CHARLIE.address) == 250

        assert self.get_commons_balance() == 62

        assert self.get_account_list() == [self.ALICE.address, self.BOB.address, self.CHARLIE.address]

    def test_alice_tick(self):
        self.sim.genesis.timestamp += 30 * 86400
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["tick"])
        assert result(ans) == [1]
        assert self.get_account_balance(self.ALICE.address) == 995893223830
        assert self.get_account_timestamp(self.ALICE.address) == self.sim.genesis.timestamp
        assert self.get_account_tax_credits(self.ALICE.address) == 4106776170
        assert self.get_commons_balance() == 4106776170

    def test_alice_bob_tick(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 10000000])
        assert result(ans) == []

        self.sim.genesis.timestamp += 30 * 86400
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["tick"])
        assert result(ans) == [2]

        assert self.get_account_balance(self.ALICE.address) == 995882766970
        assert self.get_account_timestamp(self.ALICE.address) == self.sim.genesis.timestamp
        assert self.get_account_tax_credits(self.ALICE.address) == 4107233030

        assert self.get_account_balance(self.BOB.address) == 9958960
        assert self.get_account_timestamp(self.BOB.address) == self.sim.genesis.timestamp
        assert self.get_account_tax_credits(self.BOB.address) == 41040

        assert self.get_commons_balance() == 4107274070

    def test_hash(self):
        proposal_id_bob = self.get_proposal_id("grant to bob")
        assert proposal_id_bob == 82884732143192300288868108433691753839884641754571232824914642588078699974444

        ans = self.sim.tx(self.ALICE, self.contract, 0, ["hash", "grant to bob"])
        assert result(ans) == [proposal_id_bob]

    def test_alice_propose_grant_to_bob_and_alice(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []

        self.sim.genesis.timestamp += 30 * 86400
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["tick"])
        assert result(ans) == [1]

        assert self.get_account_balance(self.ALICE.address) == 995893222780
        assert self.get_account_timestamp(self.ALICE.address) == self.sim.genesis.timestamp
        assert self.get_account_tax_credits(self.ALICE.address) == 4106776220

        # Bob doesn't have enough capital to pay tax
        assert self.get_account_balance(self.BOB.address) == 1000
        assert self.get_account_timestamp(self.BOB.address) == self.sim.genesis.timestamp - 30 * 86400
        assert self.get_account_tax_credits(self.BOB.address) == 0

        assert self.get_commons_balance() == 4106776220

        # Propose 5000 grant for Bob to be paid out of Commons
        proposal_id_bob = self.get_proposal_id("grant to bob")
        print proposal_id_bob

        ans = self.sim.tx(self.ALICE, self.contract, 0, ["hash", "grant to bob"])
        assert result(ans) == [proposal_id_bob]

        ans = self.sim.tx(self.ALICE, self.contract, 0, ["propose", "grant to bob", self.BOB.address, 5000])
        assert result(ans) == [proposal_id_bob]

        assert self.get_account_balance(self.ALICE.address) == 995893222780
        assert self.get_account_timestamp(self.ALICE.address) == self.sim.genesis.timestamp
        assert self.get_account_tax_credits(self.ALICE.address) == 4106776220

        assert self.get_proposal_recipient("grant to bob") == self.BOB.address
        assert self.get_proposal_amount("grant to bob") == 5000
        assert self.get_proposal_votes("grant to bob") == 0

        assert self.get_proposal_list() == [coerce_addr_to_hex(proposal_id_bob)]

        # Make sure charlie's account exists
        ans = self.sim.tx(self.BOB, self.contract, 0, ["pay", self.CHARLIE.address, 250])
        assert result(ans) == []

        # Propose 1000 grant for Charlie to be paid out of Commons
        proposal_id_charlie = self.get_proposal_id("grant to charlie")
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["propose", "grant to charlie", self.CHARLIE.address, 1000])
        assert result(ans) == [proposal_id_charlie]

        assert self.get_proposal_recipient("grant to charlie") == self.CHARLIE.address
        assert self.get_proposal_amount("grant to charlie") == 1000
        assert self.get_proposal_votes("grant to charlie") == 0

        assert self.get_proposal_list() == [coerce_addr_to_hex(proposal_id_bob), coerce_addr_to_hex(proposal_id_charlie)]

    def test_alice_propose_grant_to_nonexisting_account(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []

        self.sim.genesis.timestamp += 30 * 86400
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["tick"])
        assert result(ans) == [1]

        ans = self.sim.tx(self.ALICE, self.contract, 0, ["propose", "grant to charlie", self.CHARLIE.address, 5000])
        with pytest.raises(ContractError) as e:
            assert result(ans)
        assert e.value.message == "invalid to account"

    def test_alice_propose_grant_without_tax_credits(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []

        ans = self.sim.tx(self.BOB, self.contract, 0, ["propose", "grant to alice", self.ALICE.address, 5000])
        with pytest.raises(ContractError) as e:
            assert result(ans)
        assert e.value.message == "sender has no tax credits"

    def test_alice_propose_grant_to_bob_and_votes(self):
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["pay", self.BOB.address, 1000])
        assert result(ans) == []

        self.sim.genesis.timestamp += 30 * 86400
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["tick"])
        assert result(ans) == [1]

        assert self.get_commons_balance() == 4106776220

        # Propose 5000 grant for Bob to be paid out of Commons
        proposal_id_bob = self.get_proposal_id("grant to bob")
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["propose", "grant to bob", self.BOB.address, 5000])
        assert result(ans) == [proposal_id_bob]

        # Vote on own proposal, with 1/3th of total credits
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["vote", "grant to bob", 1368925406])
        assert result(ans) == [proposal_id_bob]

        assert self.get_account_tax_credits(self.ALICE.address) == 2737850814
        assert self.get_proposal_votes("grant to bob") == 1368925406

        # 2/3 majority not yet reached
        assert self.get_commons_balance() == 4106776220
        assert self.get_account_balance(self.BOB.address) == 1000

        # Vote again on own proposal, with another 1/3th of credits plus 1
        ans = self.sim.tx(self.ALICE, self.contract, 0, ["vote", "grant to bob", 1368925407])
        assert result(ans) == [1]

        # 2/3 majority reached and bob paid
        assert self.get_commons_balance() == 4106771220
        assert self.get_account_balance(self.BOB.address) == 6000

        # proposal reset
        assert self.get_proposal_recipient("grant to bob") == '0000000000000000000000000000000000000000'
        assert self.get_proposal_amount("grant to bob") == 0
        assert self.get_proposal_votes("grant to bob") == 0
