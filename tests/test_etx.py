from ethereum import tester

class TestEtxContract(object):

    CONTRACT = 'contracts/etx.se'

    def setup_class(cls):
        cls.s = tester.state()
        cls.c = cls.s.abi_contract(cls.CONTRACT)
        cls.snapshot = cls.s.snapshot()
        cls.initialBalance = 1000000 * 10 ** 5

    def setup_method(self, method):
        self.s.revert(self.snapshot)

    def test_negative_send_should_fail(self):
        assert self.c.transfer(tester.a0, -1000, sender=tester.k1) == 0
        assert self.c.balanceOf(tester.a0) == self.initialBalance
        assert self.c.balanceOf(tester.a1) == 0

    def test_send_with_invalid_recipient_should_not_overwrite_internal_settings(self):
        assert self.c.transfer(0, 1) == 0
        assert self.s.block.get_storage_data(self.c.address, 0) == 1410973349

        assert self.c.transfer(-1000, 1) == 0

    def test_simple_transfer_without_balance_should_fail(self):
        assert self.c.transfer(tester.a2, 1, sender=tester.k1) == 0

    def test_simple_transfer(self):
        assert self.c.transfer(tester.a1, 10000) == 1
        assert self.c.balanceOf(tester.a1) == 10000

    def test_approve_then_transfer(self):
        assert self.c.approve(tester.a1, 10000) == 1
        assert self.c.allowance(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, tester.a1, 10000, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 10000
        assert self.c.allowance(tester.a0, tester.a1) == 0

    def test_approve_twice_then_transfer(self):
        assert self.c.approve(tester.a1, 10000) == 1
        assert self.c.allowance(tester.a0, tester.a1) == 10000
        assert self.c.approve(tester.a1, 10000) == 1
        assert self.c.allowance(tester.a0, tester.a1) == 20000
        assert self.c.transferFrom(tester.a0, tester.a1, 10000, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 10000
        assert self.c.balanceOf(tester.a0) == self.initialBalance - 10000
        assert self.c.allowance(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, tester.a1, 10000, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 20000
        assert self.c.balanceOf(tester.a0) == self.initialBalance - 20000
        assert self.c.allowance(tester.a0, tester.a1) == 0

    def test_approve_send_to_another(self):
        assert self.c.approve(tester.a1, 10000) == 1
        assert self.c.allowance(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, tester.a2, 10000, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a2) == 10000
        assert self.c.allowance(tester.a0, tester.a1) == 0

    def test_approve_then_unapprove(self):
        assert self.c.approve(tester.a1, 10000) == 1
        assert self.c.allowance(tester.a0, tester.a1) == 10000
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.allowance(tester.a0, tester.a1) == 0
        assert self.c.transferFrom(tester.a0, tester.a2, 10000, sender=tester.k1) == 0
