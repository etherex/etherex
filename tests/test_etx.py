from ethereum import tester
# from ethereum import utils

class TestEtxContract(object):

    CONTRACT = 'contracts/etx.se'

    def setup_class(cls):
        cls.s = tester.state()
        cls.c = cls.s.abi_contract(cls.CONTRACT)
        cls.snapshot = cls.s.snapshot()

    def setup_method(self, method):
        self.s.revert(self.snapshot)

    def test_negative_send_should_fail(self):
        assert self.c.transfer(-1000, tester.a0, sender=tester.k1) == 0
        assert self.c.balanceOf(tester.a0) == 100000000000
        assert self.c.balanceOf(tester.a1) == 0

    def test_send_with_invalid_recipient_should_not_overwrite_internal_settings(self):
        assert self.c.transfer(1, 0) == 0
        assert self.s.block.get_storage_data(self.c.address, 0) == 1410973349
        # assert self.s.block.get_storage_data(self.c.address, 0) == utils.big_endian_to_int(tester.a0)

        assert self.c.transfer(1, -1000) == 0

    def test_approve_once_transfer_and_reset(self):
        assert self.c.approveOnce(tester.a1, 10000) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, 10000, tester.a1, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 10000
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0

    def test_approve_once_send_to_another(self):
        assert self.c.approveOnce(tester.a1, 10000) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 10000
        assert self.c.transferFrom(tester.a0, 10000, tester.a2, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a2) == 10000
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0

    def test_approve_once_then_unapprove(self):
        assert self.c.approveOnce(tester.a1, 10000) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 10000
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0
        assert self.c.transferFrom(tester.a0, 10000, tester.a2, sender=tester.k1) == 0

    # Unused with exchange but implemented for completeness
    def test_approve_and_reset(self):
        assert self.c.approve(tester.a1) == 1
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.transferFrom(tester.a0, 10000, tester.a1, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a1) == 10000
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 0

    def test_approve_send_to_another(self):
        assert self.c.approve(tester.a1) == 1
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.transferFrom(tester.a0, 10000, tester.a2, sender=tester.k1) == 1
        assert self.c.balanceOf(tester.a2) == 10000
        assert self.c.isApprovedFor(tester.a0, tester.a1) == 1
        assert self.c.unapprove(tester.a1) == 1
        assert self.c.isApprovedOnceFor(tester.a0, tester.a1) == 0
