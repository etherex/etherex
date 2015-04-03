from pyethereum import tester

class TestEtxContract(object):

    CONTRACT = 'contracts/etx.se'

    def setup_class(cls):
        cls.s = tester.state()
        cls.c = cls.s.abi_contract(cls.CONTRACT)
        cls.snapshot = cls.s.snapshot()

    def setup_method(self, method):
        self.s.revert(self.snapshot)

    def test_negative_send_should_fail(self):
        assert self.c.send(tester.a0, -1000, sender=tester.k1) == 0
        assert self.c.balance(tester.a0) == 100000000000
        assert self.c.balance(tester.a1) == 0

    def test_change_ownership_with_invalid_address_should_fail(self):
        # Should succeed with valid address
        assert self.c.change_ownership(tester.a1, sender=tester.k0) == 1
        assert self.s.block.get_storage_data(self.c.address, 0) == int(tester.a1, 16)

        # Should then fail with invalid address
        assert self.c.change_ownership(0, sender=tester.k1) == 0
        assert self.c.change_ownership(-1000, sender=tester.k1) == 0
        assert self.s.block.get_storage_data(self.c.address, 0) == int(tester.a1, 16)

        # Should succeed again with valid address
        assert self.c.change_ownership(tester.a0, sender=tester.k1) == 1
        assert self.s.block.get_storage_data(self.c.address, 0) == int(tester.a0, 16)

    def test_set_exchange_with_invalid_address_or_market_id_should_fail(self):
        assert self.c.set_exchange(tester.a0, 1)
        assert self.s.block.get_storage_data(self.c.address, 1) == int(tester.a0, 16)

        assert self.c.set_exchange(0xdeadbeef, 1, sender=tester.k0)
        assert self.s.block.get_storage_data(self.c.address, 1) == 0xdeadbeef

        assert self.c.set_exchange(0, 1, sender=tester.k0) == 0
        assert self.c.set_exchange(1, 0, sender=tester.k0) == 0
        assert self.s.block.get_storage_data(self.c.address, 1) == 0xdeadbeef

    def test_send_with_invalid_recipient_should_not_overwrite_internal_settings(self):
        assert self.c.set_exchange(0xdeadbeef, 999)

        assert self.c.send(0, 1) == 0
        assert self.s.block.get_storage_data(self.c.address, 0) == int(tester.a0, 16)

        assert self.c.send(-1000, 1) == 0
        assert self.s.block.get_storage_data(self.c.address, 1) == 0xdeadbeef
        assert self.s.block.get_storage_data(self.c.address, 2) == 999
