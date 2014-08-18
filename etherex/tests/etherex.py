# etherex.py -- EtherEx tests
#
# Copyright (c) 2014 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

from pyethereum import tester

# import logging

from pyethereum import processblock
processblock.enable_debug()

class TestEtherEx(object):

    ALICE = { 'address': tester.a0, 'key': tester.k0 }
    BOB = { 'address': tester.a1, 'key': tester.k1 }
    CHARLIE = { 'address': tester.a2, 'key': tester.k2 }

    @classmethod
    def setup_class(cls):
        # NameReg
        cls.ncode = open('contracts/namereg.se').read()

        # EtherEx contracts
        cls.code = open('contracts/etherex.se').read()
        cls.bcode = open('contracts/balances.se').read()
        cls.icode = open('contracts/indexes.se').read()
        cls.tcode = open('contracts/trades.se').read()
        cls.ccode = open('contracts/currencies.se').read()
        cls.xcode = open('contracts/xeth.se').read()

        # cls.sim = Simulator({cls.ALICE.address: 10**24,
        #                      cls.BOB.address: 10**24,
        #                      cls.CHARLIE.address: 10**24})

    def setup_method(self, method):
        self.state = tester.state()

        self.ncontract = self.state.contract(self.ncode)

        self.contract = self.state.contract(self.code)
        self.bcontract = self.state.contract(self.bcode)
        self.icontract = self.state.contract(self.icode)
        self.tcontract = self.state.contract(self.tcode)
        self.ccontract = self.state.contract(self.ccode)
        self.xcontract = self.state.contract(self.xcode)

    def hex_pad(self, x):
        return "{0:#0{1}x}".format(x, 66)

    def xhex(self, x):
        value = "{0:#x}".format(x)
        if len(value) % 2 != 0:
            value = "0x0" + value[2:]
        return value

    def _storage(self, contract, idx):
        idx = self.hex_pad(idx)
        return self.state.block.account_to_dict(contract)['storage'].get(idx)

    def test_creation(self):
        assert self._storage(self.contract, 10) == "0x88554646bb"
        assert self._storage(self.contract, 15) == "0x" + self.ALICE['address']
        assert self._storage(self.bcontract, 15) == "0x" + self.ALICE['address']
        assert self._storage(self.icontract, 15) == "0x" + self.ALICE['address']
        assert self._storage(self.tcontract, 15) == "0x" + self.ALICE['address']
        assert self._storage(self.ccontract, 15) == "0x" + self.ALICE['address']
        assert self._storage(self.xcontract, 15) == "0x" + self.ALICE['address']

    def test_initialize(self):
        ans = self.state.send(self.ALICE['key'], self.ncontract, 0, ["Alice"])
        assert ans == [1]
        assert self._storage(self.ncontract, int(self.ALICE['address'], 16)) == "0x" + "Alice".encode('hex')

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [self.bcontract, self.icontract, self.tcontract, self.ccontract, self.ncontract, "EtherEx"])
        assert ans == [1]
        assert self._storage(self.ncontract, int(self.contract, 16)) == "0x" + "EtherEx".encode('hex') # 0x4574686572457800000000000000000000000000000000000000000000000000
        assert self._storage(self.contract, 10) == "0x88554646bb"

        ans = self.state.send(self.ALICE['key'], self.bcontract, 10**18, [self.contract, self.ncontract, "EtherEx - Balances"])
        assert ans == [1]

        ans = self.state.send(self.ALICE['key'], self.icontract, 0, [self.contract, self.ncontract, "EtherEx - Indexes"])
        assert ans == [1]

        ans = self.state.send(self.ALICE['key'], self.tcontract, 0, [self.contract, self.ncontract, "EtherEx - Trades"])
        assert ans == [1]

        ans = self.state.send(self.ALICE['key'], self.ccontract, 0, [self.contract, self.ncontract, "EtherEx - Currencies"])
        assert ans == [1]

        assert self._storage(self.contract, 3) == "0x" + self.bcontract
        assert self._storage(self.contract, 4) == "0x" + self.icontract
        assert self._storage(self.contract, 5) == "0x" + self.tcontract
        assert self._storage(self.contract, 6) == "0x" + self.ccontract
        # assert self._storage(self.bcontract, "b5b8c62dd5a20793b6c562e002e7e0aa68316d31") == 333333333333333333
        assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10 ** 18)
        assert self._storage(self.bcontract, 15) == "0x" + self.contract
        assert self._storage(self.icontract, 15) == "0x" + self.contract
        assert self._storage(self.tcontract, 15) == "0x" + self.contract
        assert self._storage(self.ccontract, 15) == "0x" + self.contract

        ans = self.state.send(self.ALICE['key'], self.contract, 1 * 10 ** 18, [7, 1 * 10 ** 18, 1 * 10 ** 8, "XETH", self.xcontract])

        # print self.sim.get_storage_dict(self.ccontract)
        assert ans == [1]
        assert self._storage(self.ccontract, 100) == "0x" + "XETH".encode('hex')
        assert self._storage(self.ccontract, 101) == self.xhex(10 ** 18)
        assert self._storage(self.ccontract, 102) == self.xhex(10 ** 8)
        assert self._storage(self.ccontract, 103) == "0x" + self.xcontract
        assert self._storage(self.ccontract, 104) == self.xhex(1)


    def test_change_ownership(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [8, 0xf9e57456f18d90886263fedd9cc30b27cd959137])
        assert ans == [0xf9e57456f18d90886263fedd9cc30b27cd959137]
        # self.run(tx, self.contract)
        # print 20 * "="

    #
    # Balances
    #
    def test_alice_to_bob(self):
        # ans = self.state.send(self.ALICE['key'], self.bcontract, 10**18, [self.contract])
        # assert ans == [1]
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.bcontract, 0, [self.BOB['address'], 1000])

        assert ans == [1]
        assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10**18 - 1000)
        assert self._storage(self.bcontract, int(self.BOB['address'], 16)) == self.xhex(1000)

    def test_bob_to_charlie_invalid(self):
        # ans = self.state.send(self.ALICE['key'], self.bcontract, 10**18, [self.contract])
        # assert ans == [1]
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.bcontract, 0, [self.CHARLIE['address'], 2000])

        assert ans == [4]
        assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10 ** 18)
        assert self._storage(self.bcontract, int(self.BOB['address'], 16)) == None
        assert self._storage(self.bcontract, int(self.CHARLIE['address'], 16)) == None

    def test_alice_to_bob_to_charlie_valid(self):
        # ans = self.state.send(self.ALICE['key'], self.bcontract, 10**18, [self.contract])
        # assert ans == [1]
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.bcontract, 0, [self.BOB['address'], 1000])
        assert ans == [1]

        ans = self.state.send(self.BOB['key'], self.bcontract, 0, [self.CHARLIE['address'], 250])
        assert ans == [1]

        assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10 ** 18 - 1000)
        assert self._storage(self.bcontract, int(self.BOB['address'], 16)) == self.xhex(750)
        assert self._storage(self.bcontract, int(self.CHARLIE['address'], 16)) == self.xhex(250)
        # assert self.sim.get_storage_dict(self.bcontract) == ''

    def test_check_balances_ownership(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.bcontract, 0, [int(self.contract, 16), 0, 3])
        assert ans == [int(self.contract, 16)]

    def test_check_balances(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.bcontract, 0, [self.ALICE['address'], 0, 1])
        assert ans == [1000000000000000000]

    def test_deposit_eth(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 1 * 10 ** 17, [4])
        assert ans == [1] # [int(self.bcontract, 16)]
        assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10 ** 18 + 10 ** 17)

    def test_withdraw_eth(self):
        self.test_deposit_eth()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [5, 1 * 10 ** 17])
        assert ans == [1]
        assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10 ** 18)

    def test_withdraw_eth_invalid(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [5, 10 ** 19])

        assert ans == [0]


    #
    # EtherEx
    #
    def test_no_data(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [])

        assert ans == [0] # .startswith("No data")

    def test_invalid_operation(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [0, 0])

        assert ans == [2] # "Invalid operation"

    def test_missing_amount(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1])

        assert ans == [3] # "Missing amount"

    def test_invalid_amount(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 0])

        assert ans == [4] # "Invalid amount"

    def test_missing_price(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 1])

        assert ans == [5] # "Missing price"

    def test_invalid_price(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 1, 0])

        assert ans == [6] # "Invalid price"

    def test_missing_market_id(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 1, 1 * 10 ** 8])

        assert ans == [7] # "Missing market ID"

    def test_invalid_market_id(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 1, 1 * 10 ** 8, 2])

        assert ans == [8] # "Invalid market ID"

    def test_too_many_arguments(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 1000 * 10 ** 21, 1 * 10 ** 8, 1, 1])

        assert ans == [9] # .startswith("Too many arguments")

    def test_amount_out_of_range(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 2**254 + 1, 1 * 10 ** 8 + 1, 1])

        assert ans == [10] # .startswith("Amount out of range")

    def test_price_out_of_range(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [1, 1 * 10 ** 8, 2**254 + 1, 1])

        assert ans == [11] #.startswith("Price out of range")

    # # def test_insufficient_btc_trade(self):
    # #     tx = Tx(sender='alice', value=0, data=[1, 1 * 10 ** 6, 1000 * 10 ** 8, 1])
    # #     self.run(tx, self.contract)
    # #     assert self.stopped == 12 #.startswith("Minimum BTC trade amount not met")
    # #     assert self.contract.storage[1] == 1

    def test_insufficient_buy_trade(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [1, 1 * 10 ** 17, 1000 * 10 ** 8, 1])

        assert ans == [12] #.startswith("Minimum XETH trade amount not met")

    def test_insufficient_sell_trade(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 1 * 10 ** 17, [2, 1 * 10 ** 17, 1000 * 10 ** 8, 1])
        assert ans == [13] #.startswith("Minimum ETH value not met")

    def test_insufficient_mismatch_sell_trade(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 1 * 10 ** 18, [2, 1 * 10 ** 19, 1000 * 10 ** 8, 1])
        assert ans == [14] #.startswith("Minimum ETH value not met")

    def test_add_bob_coin(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 10 * 10 ** 18, [7, 1 * 10 ** 18, 1 * 10 ** 8, "BOB", self.BOB['address']]) # AKA BobScam

        # print self.sim.get_storage_dict(self.ccontract)
        assert ans == [2]
        assert self._storage(self.ccontract, 105) == "0x" + "BOB".encode('hex')
        assert self._storage(self.ccontract, 106) == self.xhex(1 * 10 ** 18)
        assert self._storage(self.ccontract, 107) == self.xhex(1 * 10 ** 8)
        assert self._storage(self.ccontract, 108) == "0x" + self.BOB['address']
        assert self._storage(self.ccontract, 109) == self.xhex(2)

    def test_check_bob_coin(self):
        self.test_add_bob_coin()

        # print self.sim.get_storage_dict(self.contract)
        # print self.sim.get_storage_dict(self.ccontract)
        ans = self.state.send(self.ALICE['key'], self.contract, 1 * 10 ** 18, [2, 1 * 10 ** 18, 1000 * 10 ** 8, 2])
        assert ans == [100] #[int("ETH/BOB".encode('hex'), 16)]
        # assert ans == [int(self.BOB['address'], 16)]

    def test_first_sell(self):
        self.test_initialize()

        # initial_balance = self.state.block.get_balance(self.ALICE['address'])

        ans = self.state.send(self.ALICE['key'], self.contract, 1 * 10 ** 21, [2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])

        assert ans == [100]
        assert self._storage(self.tcontract, 100) == self.xhex(2)
        assert self._storage(self.tcontract, 101) == self.xhex(1000 * 10 ** 8)
        assert self._storage(self.tcontract, 102) == self.xhex(1 * 10 ** 21)
        assert self._storage(self.tcontract, 103) == "0x" + self.ALICE['address']
        assert self._storage(self.tcontract, 104) == self.xhex(1)

        # assert self.state.block.get_balance(self.ALICE['address']) == 998997926207000000000000 # 10 ** 24 - 10 ** 21

    def test_cancel_trade(self):
        self.test_first_sell()

        initial_balance = self.state.block.get_balance(self.ALICE['address'])

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [6, 100])

        assert ans == [1]

        assert len(self.state.block.get_transactions()) == 16
        assert self._storage(self.tcontract, 100) == None
        assert self.state.block.get_balance(self.ALICE['address']) > initial_balance

    def test_cancel_trade_invalid(self):
        self.test_first_sell()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [6, 100])
        assert ans == [0]

    def test_fulfill_first_sell_with_buy(self):
        self.test_first_sell()

        ans = self.state.send(self.BOB['key'], self.contract, 10 ** 21, [3, 100])
        assert ans == [1]
        # assert ans == [10 ** 21]

    def test_second_sell(self):
        self.test_first_sell()

        ans = self.state.send(self.BOB['key'], self.contract, 1 * 10 ** 21, [2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])

        assert ans == [105]
        assert self._storage(self.tcontract, 105) == self.xhex(2)
        assert self._storage(self.tcontract, 106) == self.xhex(1000 * 10 ** 8)
        assert self._storage(self.tcontract, 107) == self.xhex(10 ** 21)
        assert self._storage(self.tcontract, 108) == "0x" + self.BOB['address']
        assert self._storage(self.tcontract, 109) == self.xhex(1)
        # print self.sim.get_storage_dict(self.contract)
        # print "=" * 20
        # print self.sim.get_storage_dict(self.bcontract)
        # print "=" * 20
        # print self.sim.get_storage_dict(self.icontract)
        # print "=" * 20
        # print self.sim.get_storage_dict(self.tcontract)

    def test_first_buy(self):
        self.test_second_sell()

        ans = self.state.send(self.CHARLIE['key'], self.contract, 0, [1, 1 * 10 ** 21, 1000 * 10 ** 8, 1])

        assert ans == [110]
        assert self._storage(self.tcontract, 110) == self.xhex(1) # TODO status
        assert self._storage(self.tcontract, 111) == self.xhex(1000 * 10 ** 8)
        assert self._storage(self.tcontract, 112) == self.xhex(10 ** 21)
        assert self._storage(self.tcontract, 113) == "0x" + self.CHARLIE['address']
        assert self._storage(self.tcontract, 114) == self.xhex(1)
        # print self.sim.get_storage_dict(self.contract)
        # print "=" * 20
        # print self.sim.get_storage_dict(self.bcontract)
        # print "=" * 20
        # print self.sim.get_storage_dict(self.icontract)
        # print "=" * 20
        # print self.sim.get_storage_dict(self.tcontract)

    # def test_second_buy_with_leftover(self):
    #     tx = Tx(sender='alice', value=0, data=[1, 1500 * 10 ** 18, 1000 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_bigger_sell(self):
    #     tx = Tx(sender='bob', value=1500 * 10 ** 18, data=[2, 1500 * 10 ** 18, 1200 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_bigger_buy_but_less(self):
    #     tx = Tx(sender='alice', value=1200 * 10 ** 18, data=[1, 1200 * 10 ** 18, 1200 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_buy_other_amount(self):
    #     tx = Tx(sender='charlie', value=4200 * 10 ** 18, data=[1, 4000 * 10 ** 18, 1100 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_sell_twice_that_amount(self):
    #     tx = Tx(sender='bob', value=8000 * 10 ** 21, data=[2, 8000 * 10 ** 18, 1100 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_another_buy_at_that_price(self):
    #     tx = Tx(sender='charlie', value=5000 * 10 ** 18, data=[1, 4500 * 10 ** 18, 1100 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_sell_lower_cross_index_check(self):
    #     tx = Tx(sender='bob', value=20000 * 10 ** 18, data=[2, 20000 * 10 ** 18, 900 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_buy_lower_cross_index_fail(self):
    #     tx = Tx(sender='charlie', value=2500 * 10 ** 18, data=[1, 2500 * 10 ** 18, 900 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_sell_back_at_first_price(self):
    #     tx = Tx(sender='bob', value=2500 * 10 ** 18, data=[2, 500 * 10 ** 18, 1000 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_index_replacing(self):
    #     tx = Tx(sender='charlie', value=2500 * 10 ** 18, data=[2, 2500 * 10 ** 18, 950 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_other_amount_again(self):
    #     tx = Tx(sender='alice', value=2500 * 10 ** 18, data=[1, 2500 * 10 ** 18, 1100 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_whale_sell(self):
    #     tx = Tx(sender='bob', value=5 * 10 ** 28, data=[2, 5 * 10 ** 28, 800 * 10 ** 8, 1])
    #     self.run(tx, self.contract)

    # def test_whale_buy(self):
    #     tx = Tx(sender='bob', value=0, data=[1, 10 * 10 ** 28, 1500 * 10 ** 8, 1])
    #     self.run(tx, self.contract)