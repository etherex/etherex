# etherex.py -- EtherEx tests
#
# Copyright (c) 2014 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

import sys
sys.path.insert(0, './evm-sim/tests')
from sim import Key, Simulator, compile_serpent
from pyethereum import processblock
processblock.expensive_debug = True

class TestEtherEx(object):

    ALICE = Key('alice')
    BOB = Key('bob')
    CHARLIE = Key('charlie')

    @classmethod
    def setup_class(cls):
        # NameReg
        cls.ncode = compile_serpent('contracts/namereg.se')

        # EtherEx contracts
        cls.code = compile_serpent('contracts/etherex.se')
        cls.bcode = compile_serpent('contracts/balances.se')
        cls.icode = compile_serpent('contracts/indexes.se')
        cls.tcode = compile_serpent('contracts/trades.se')
        cls.ccode = compile_serpent('contracts/currencies.se')

        cls.sim = Simulator({cls.ALICE.address: 10**24,
                             cls.BOB.address: 10**24,
                             cls.CHARLIE.address: 10**24})

    def setup_method(self, method):
        self.sim.reset()

        self.ncontract = self.sim.load_contract(self.ALICE, self.ncode)

        self.contract = self.sim.load_contract(self.ALICE, self.code, 0, 100000)
        self.bcontract = self.sim.load_contract(self.ALICE, self.bcode)
        self.icontract = self.sim.load_contract(self.ALICE, self.icode)
        self.tcontract = self.sim.load_contract(self.ALICE, self.tcode)
        self.ccontract = self.sim.load_contract(self.ALICE, self.ccode)

    def test_creation(self):
        assert self.sim.get_storage_data(self.contract, 15) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.bcontract, 15) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.icontract, 15) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.tcontract, 15) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.ccontract, 15) == int(self.ALICE.address, 16)

    def test_initialize(self):
        ans = self.sim.tx(self.ALICE, self.ncontract, 0, ["Alice"])
        assert ans == [1]
        assert self.sim.get_storage_data(self.ncontract, int(self.ALICE.address, 16)) == int("Alice".encode('hex'), 16)

        ans = self.sim.tx(self.ALICE, self.contract, 0, [self.bcontract, self.icontract, self.tcontract, self.ccontract, self.ncontract])
        ans = self.sim.tx(self.ALICE, self.bcontract, 10**18, [self.contract, self.ncontract])
        ans = self.sim.tx(self.ALICE, self.icontract, 0, [self.contract, self.ncontract])
        ans = self.sim.tx(self.ALICE, self.tcontract, 0, [self.contract, self.ncontract])
        ans = self.sim.tx(self.ALICE, self.ccontract, 0, [self.contract, self.ncontract])

        assert ans == [1]
        assert self.sim.get_storage_data(self.contract, 3) == int(self.bcontract, 16)
        assert self.sim.get_storage_data(self.contract, 4) == int(self.icontract, 16)
        assert self.sim.get_storage_data(self.contract, 5) == int(self.tcontract, 16)
        assert self.sim.get_storage_data(self.contract, 6) == int(self.ccontract, 16)
        assert self.sim.get_storage_data(self.bcontract, "b5b8c62dd5a20793b6c562e002e7e0aa68316d31") == 333333333333333333
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 10 ** 18
        assert self.sim.get_storage_data(self.bcontract, 15) == int(self.contract, 16)
        assert self.sim.get_storage_data(self.icontract, 15) == int(self.contract, 16)
        assert self.sim.get_storage_data(self.tcontract, 15) == int(self.contract, 16)
        assert self.sim.get_storage_data(self.ccontract, 15) == int(self.contract, 16)

    # Balances
    def test_alice_to_bob(self):
        # ans = self.sim.tx(self.ALICE, self.bcontract, 10**18, [self.contract])
        # assert ans == [1]
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.bcontract, 0, [self.BOB.address, 1000])

        assert ans == [1]
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 10**18 - 1000
        assert self.sim.get_storage_data(self.bcontract, self.BOB.address) == 1000

    def test_bob_to_charlie_invalid(self):
        # ans = self.sim.tx(self.ALICE, self.bcontract, 10**18, [self.contract])
        # assert ans == [1]
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.bcontract, 0, [self.CHARLIE.address, 2000])

        assert ans == [4]
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 10**18
        assert self.sim.get_storage_data(self.bcontract, self.BOB.address) == 0
        assert self.sim.get_storage_data(self.bcontract, self.CHARLIE.address) == 0

    def test_alice_to_bob_to_charlie_valid(self):
        # ans = self.sim.tx(self.ALICE, self.bcontract, 10**18, [self.contract])
        # assert ans == [1]
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.bcontract, 0, [self.BOB.address, 1000])
        assert ans == [1]

        ans = self.sim.tx(self.BOB, self.bcontract, 0, [self.CHARLIE.address, 250])
        assert ans == [1]

        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 10**18 - 1000
        assert self.sim.get_storage_data(self.bcontract, self.BOB.address) == 750
        assert self.sim.get_storage_data(self.bcontract, self.CHARLIE.address) == 250
        # assert self.sim.get_storage_dict(self.bcontract) == ''


    def test_change_ownership(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.contract, 0, [8, 0xf9e57456f18d90886263fedd9cc30b27cd959137])
        assert ans == [0xf9e57456f18d90886263fedd9cc30b27cd959137]
        # self.run(tx, self.contract)
        # print 20 * "="

    # - XETH (Balances)
    def test_check_xeth_balance(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.bcontract, 0, [self.ALICE.address, 0, 1])
        assert ans == [1000000000000000000]

    def test_transfer_eth_to_xeth(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.contract, 1 * 10 ** 17, [3, 1 * 10 ** 17, 0])
        assert ans == [1]
        assert self.sim.get_storage_data(self.bcontract, self.ALICE.address) == 10**18 + 10 ** 17

    def test_check_xeth_ownership(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.bcontract, 0, [int(self.contract, 16), 0, 3])
        assert ans == [int(self.contract, 16)]


    # EtherEx
    def test_no_data(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [])

        assert ans == [0] # .startswith("No data")

    def test_invalid_operation(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [0, 0])

        assert ans == [2] # "Invalid operation"

    def test_missing_amount(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1])

        assert ans == [3] # "Missing amount"

    def test_invalid_amount(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 0])

        assert ans == [4] # "Invalid amount"

    def test_missing_price(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 1])

        assert ans == [5] # "Missing price"

    def test_invalid_price(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 1, 0])

        assert ans == [6] # "Invalid price"

    def test_missing_market_id(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 1, 1 * 10 ** 8])

        assert ans == [7] # "Missing market ID"

    def test_invalid_market_id(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 1, 1 * 10 ** 8, 2])

        assert ans == [8] # "Invalid market ID"

    def test_too_many_arguments(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 1000 * 10 ** 21, 1 * 10 ** 8, 1, 1])

        assert ans == [9] # .startswith("Too many arguments")

    def test_amount_out_of_range(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 2**254 + 1, 1 * 10 ** 8 + 1, 1])

        assert ans == [10] # .startswith("Amount out of range")

    def test_price_out_of_range(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 0, [1, 1 * 10 ** 8, 2**254 + 1, 1])

        assert ans == [11] #.startswith("Price out of range")

    def test_insufficient_xeth_trade(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.contract, 0, [2, 1 * 10 ** 18, 1000 * 10 ** 8, 1])

        assert ans == [12] #.startswith("Minimum XETH trade amount not met")

    def test_insufficient_eth(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.contract, 1 * 10 ** 18, [2, 1 * 10 ** 19, 1000 * 10 ** 8, 1])
        assert ans == [13] #.startswith("Minimum ETH value not met")

    # # def test_insufficient_btc_trade(self):
    # #     tx = Tx(sender='alice', value=0, data=[1, 1 * 10 ** 6, 1000 * 10 ** 8, 1])
    # #     self.run(tx, self.contract)
    # #     assert self.stopped == 12 #.startswith("Minimum BTC trade amount not met")
    # #     assert self.contract.storage[1] == 1

    def test_add_bob_coin(self):
        self.test_initialize()

        ans = self.sim.tx(self.BOB, self.contract, 10 * 10 ** 18, [6, 1 * 10 ** 18, 1 * 10 ** 8, "ETH/BOB", self.BOB.address])

        # print self.sim.get_storage_dict(self.ccontract)
        assert ans == [42]
        assert self.sim.get_storage_data(self.ccontract, 100) == int("ETH/BOB".encode('hex'), 16)
        assert self.sim.get_storage_data(self.ccontract, 101) == 1 * 10 ** 18
        assert self.sim.get_storage_data(self.ccontract, 102) == 1 * 10 ** 8
        assert self.sim.get_storage_data(self.ccontract, 103) == int(self.BOB.address, 16)
        assert self.sim.get_storage_data(self.ccontract, 104) == 2

    def test_check_bob_coin(self):
        self.test_add_bob_coin()

        # print self.sim.get_storage_dict(self.contract)
        # print self.sim.get_storage_dict(self.ccontract)
        ans = self.sim.tx(self.ALICE, self.contract, 1 * 10 ** 18, [2, 1 * 10 ** 21, 1000 * 10 ** 8, 2])
        assert ans == [100] #[int("ETH/BOB".encode('hex'), 16)]
        # assert ans == [int(self.BOB.address, 16)]

    def test_first_sell(self):
        self.test_initialize()

        ans = self.sim.tx(self.ALICE, self.contract, 1 * 10 ** 21, [2, 1 * 10 ** 21, 1000 * 10 ** 8, 1])

        assert self.sim.get_storage_data(self.tcontract, 100) == 2
        assert self.sim.get_storage_data(self.tcontract, 101) == 1000 * 10 ** 8
        assert self.sim.get_storage_data(self.tcontract, 102) == 1 * 10 ** 21
        assert self.sim.get_storage_data(self.tcontract, 103) == int(self.ALICE.address, 16)
        assert self.sim.get_storage_data(self.tcontract, 104) == 1
        assert ans == [100]

    def test_second_sell(self):
        self.test_first_sell()

        ans = self.sim.tx(self.BOB, self.contract, 1 * 10 ** 21, [2, 1 * 10 ** 21, 1000 * 10 ** 8, 1], 100000)

        print self.sim.get_storage_dict(self.contract)
        print "=" * 20
        print self.sim.get_storage_dict(self.bcontract)
        print "=" * 20
        print self.sim.get_storage_dict(self.icontract)
        print "=" * 20
        print self.sim.get_storage_dict(self.tcontract)
        assert self.sim.get_storage_data(self.tcontract, 105) == 2
        assert self.sim.get_storage_data(self.tcontract, 106) == 1000 * 10 ** 8
        assert self.sim.get_storage_data(self.tcontract, 107) == 1 * 10 ** 21
        assert self.sim.get_storage_data(self.tcontract, 108) == int(self.BOB.address, 16)
        assert self.sim.get_storage_data(self.tcontract, 109) == 1
        assert ans == [105]

    def test_first_buy(self):
        self.test_second_sell()

        ans = self.sim.tx(self.CHARLIE, self.contract, 0, [1, 1 * 10 ** 21, 1000 * 10 ** 8, 1], 100000)

        print self.sim.get_storage_dict(self.contract)
        print "=" * 20
        print self.sim.get_storage_dict(self.bcontract)
        print "=" * 20
        print self.sim.get_storage_dict(self.icontract)
        print "=" * 20
        print self.sim.get_storage_dict(self.tcontract)
        assert self.sim.get_storage_data(self.tcontract, 110) == 1 # TODO status
        assert self.sim.get_storage_data(self.tcontract, 111) == 1000 * 10 ** 8
        assert self.sim.get_storage_data(self.tcontract, 112) == 1 * 10 ** 21
        assert self.sim.get_storage_data(self.tcontract, 113) == int(self.CHARLIE.address, 16)
        assert self.sim.get_storage_data(self.tcontract, 114) == 1
        assert ans == [110]

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