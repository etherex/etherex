from ethereum import tester
# from ethereum import utils

class TestEtxContract(object):

    CONTRACT = 'contracts/etx.se'

    def setup_class(cls):
        cls.s = tester.state()
        cls.c = cls.s.abi_contract(cls.CONTRACT, endowment=10 ** 21)
        assert cls.s.block.get_balance(cls.c.address.encode('hex')) == 10 ** 21
        cls.snapshot = cls.s.snapshot()

    def setup_method(self, method):
        self.s.revert(self.snapshot)

    def initial_issuance(self):
        assert self.c.setExchange(tester.a0) == 1
        assert self.c.issue(1000000 * 10 ** 5, tester.a0) == 1

    def test_issue_and_reward(self):
        self.initial_issuance()

        assert self.c.issue(5000 * 10 ** 5, tester.a1) == 1
        assert self.c.balanceOf(tester.a1) == 5000 * 10 ** 5
        assert self.s.block.get_storage_data(self.c.address, 2) == 1005000 * 10 ** 5

        assert self.s.block.get_balance(tester.a1.encode('hex')) == 10 ** 24
        reward = self.c.reward(5000 * 10 ** 5, sender=tester.k1, profiling=1)
        print reward
        assert reward['output'] == 4975124378109452000L
        diff = (10 ** 24 + reward['output'] - reward['gas']) - self.s.block.get_balance(tester.a1.encode('hex'))
        assert diff < 1000 and diff > -1000  # account for wrong gas profiling
        assert self.s.block.get_storage_data(self.c.address, 2) == 1000000 * 10 ** 5
        assert self.c.balanceOf(tester.a1) == 0

    def test_issue_and_burn_fail(self):
        self.initial_issuance()

        # Fail trying to issue to oneself
        assert self.c.issue(10000 * 10 ** 5, tester.a1, sender=tester.k1) == 0

        # Issue 10,000
        assert self.c.issue(10000 * 10 ** 5, tester.a1) == 1
        assert self.c.balanceOf(tester.a1) == 10000 * 10 ** 5
        assert self.s.block.get_storage_data(self.c.address, 2) == 1010000 * 10 ** 5

        # Fail to get reward for 10,001
        assert self.c.reward(10001 * 10 ** 5, sender=tester.k1) == 0

    def test_negative_send_should_fail(self):
        self.initial_issuance()
        assert self.c.transfer(-1000, tester.a0, sender=tester.k1) == 0
        assert self.c.balanceOf(tester.a0) == 1000000 * 10 ** 5
        assert self.c.balanceOf(tester.a1) == 0

    def test_set_exchange_with_invalid_address_should_fail(self):
        assert self.c.setExchange(0) == 0
        assert self.c.setExchange(-1000) == 0

        assert self.c.setExchange(0xdeadbeef)
        assert self.s.block.get_storage_data(self.c.address, 1) == 0xdeadbeef

    def test_send_with_invalid_recipient_should_not_overwrite_internal_settings(self):
        assert self.c.setExchange(0xdeadbeef)

        assert self.c.transfer(1, 0) == 0
        assert self.s.block.get_storage_data(self.c.address, 1) == 0xdeadbeef

        assert self.c.transfer(1, -1000) == 0
        assert self.s.block.get_storage_data(self.c.address, 1) == 0xdeadbeef
        assert self.s.block.get_storage_data(self.c.address, 2) == 0

    def test_approve_once_transfer_and_reset(self):
        self.initial_issuance()
        assert self.c.approveOnce(tester.a1, 10000) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, 10000, tester.a1, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 10000
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0

    def test_approve_once_send_to_another(self):
        self.initial_issuance()
        assert self.c.approveOnce(tester.a1, 10000) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, 10000, tester.a2, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a2) == 10000
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0

    def test_approve_once_then_unapprove(self):
        self.initial_issuance()
        assert self.c.approveOnce(tester.a1, 10000) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 10000
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0
        assert self.c.transferFrom(tester.a0, 10000, tester.a2, sender=tester.k1) == 0

    # Unused with exchange but implemented for completeness
    def test_approve_and_reset(self):
        self.initial_issuance()
        assert self.c.approve(tester.a1) == 1
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.transferFrom(tester.a0, 10000, tester.a1, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 10000
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 0

    def test_approve_send_to_another(self):
        self.initial_issuance()
        assert self.c.approve(tester.a1) == 1
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.transferFrom(tester.a0, 10000, tester.a2, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a2) == 10000
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0
