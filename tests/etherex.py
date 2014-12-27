# etherex.py -- EtherEx tests
#
# Copyright (c) 2014 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

from pyethereum import tester
from pyethereum.utils import sha3
import logging as logger

# DEBUG
# tester.enable_logging()
# tester.pb.pblogger.log_op = True

class TestEtherEx(object):

    ALICE = { 'address': tester.a0, 'key': tester.k0 }
    BOB = { 'address': tester.a1, 'key': tester.k1 }
    CHARLIE = { 'address': tester.a2, 'key': tester.k2 }

    # NameReg
    namereg = 'contracts/namereg.se'

    # EtherEx contracts
    etherex = 'contracts/etherex.se'
    etx = 'contracts/etx.se'

    # ABI function IDs
    PRICE = 0
    BUY = 1
    SELL = 2
    TRADE = 3
    DEPOSIT = 4
    WITHDRAW = 5
    CANCEL = 6
    ADD_MARKET = 7
    CHANGE_OWNERSHIP = 8
    GET_MARKET = 9
    GET_TRADE_IDS = 10
    GET_TRADE = 11
    GET_SUB_BALANCE = 12
    NAME_REGISTER = 13
    NAME_UNREGISTER = 14

    # Utilities
    def hex_pad(self, x):
        return "{0:#0{1}x}".format(x, 66)

    def xhex(self, x):
        value = "{0:#x}".format(x)
        if len(value) % 2 != 0:
            value = "0x0" + value[2:]
        return value

    def ptr_add(self, ptr, x=1):
        return hex(int(ptr, 16) + x)

    def _storage(self, contract, idx):
        return self.state.block.account_to_dict(contract)['storage'].get(idx)

    # Setup
    def setup_method(self, method):
        self.state = tester.state()

        self.namereg_contract = self.state.contract(self.namereg)

        self.contract = self.state.contract(self.etherex)
        self.etx_contract = self.state.contract(self.etx)
        self.bob_contract = self.state.contract(self.etx)

    def test_creation(self):
        assert self._storage(self.contract, "0x") == "0x88554646aa"
        assert self._storage(self.contract, "0x01") == "0x" + self.ALICE['address']
        assert self._storage(self.contract, "0x02") == "0x" + self.ALICE['address']

        assert self._storage(self.etx_contract, "0x" + self.ALICE['address']) == self.xhex(1000000 * 10 ** 5)

    def test_initialize(self):
        # NameReg Alice
        ans = self.state.send(
            self.ALICE['key'],
            self.namereg_contract,
            0,
            funid=0,
            abi=[self.ALICE['address'], "0x" + "Alice".encode('hex')])
        assert ans == [1]
        assert self._storage(self.namereg_contract, "0x" + self.ALICE['address']) == "0x" + "Alice".encode('hex')

        # NameReg EtherEx
        ans = self.state.send(
            self.ALICE['key'],
            self.namereg_contract,
            0,
            funid=0,
            abi=[self.contract, "0x" + "EtherEx".encode('hex')])
        assert ans == [1]
        assert self._storage(self.namereg_contract, "0x" + self.contract) == "0x" + "EtherEx".encode('hex')

        # NameReg ETX
        ans = self.state.send(
            self.ALICE['key'],
            self.namereg_contract,
            0,
            funid=0,
            abi=[self.etx_contract, "0x" + "ETX".encode('hex')])
        assert ans == [1]
        assert self._storage(self.namereg_contract, "0x" + self.etx_contract) == "0x" + "ETX".encode('hex')


        # Register ETX
        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            10 ** 18,
            funid=self.ADD_MARKET,
            abi=["0x" + "ETX".encode('hex'), self.etx_contract, 5, 10 ** 8, 10 ** 18])
        assert ans == [1]

        # Set exchange address in ETX contract
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=2,
            abi=[self.contract])
        assert ans == [1]
        assert self._storage(self.etx_contract, self.xhex(1)) == "0x" + self.contract


        # Get markets pointer...
        self.ptr = self._storage(self.contract, "0x07")
        logger.info("Markets start at %s, then %s ..." % (self.ptr, self.ptr_add(self.ptr, 1)))
        logger.info(self.state.block.account_to_dict(self.contract)['storage'])
        logger.info("===")

        assert self._storage(self.contract, self.ptr_add(self.ptr, 0)) == self.xhex(1) # Market ID
        assert self._storage(self.contract, self.ptr_add(self.ptr, 1)) == "0x" + "ETX".encode('hex') # Name
        assert self._storage(self.contract, self.ptr_add(self.ptr, 2)) == "0x" + self.etx_contract # Contract address
        assert self._storage(self.contract, self.ptr_add(self.ptr, 3)) == self.xhex(5) # Decimal precision
        assert self._storage(self.contract, self.ptr_add(self.ptr, 4)) == self.xhex(10 ** 8) # Price precision
        assert self._storage(self.contract, self.ptr_add(self.ptr, 5)) == self.xhex(10 ** 18) # Minimum amount
        assert self._storage(self.contract, self.ptr_add(self.ptr, 6)) == self.xhex(1) # Last price
        assert self._storage(self.contract, self.ptr_add(self.ptr, 7)) == "0x" + self.ALICE['address'] # Owner
        assert self._storage(self.contract, self.ptr_add(self.ptr, 8)) == None # Block #

        # assert self._storage(self.contract, "0xb") == self.xhex(1) # Market ID
        # assert self._storage(self.contract, hex(12)) == "0x" + "ETX".encode('hex') # Name
        # assert self._storage(self.contract, hex(13)) == "0x" + self.etx_contract # Contract address
        # assert self._storage(self.contract, self.ptr_add(ptr, 3)) == self.xhex(5) # Decimal precision
        # assert self._storage(self.contract, self.ptr_add(ptr, 4)) == self.xhex(10 ** 8) # Price precision
        # assert self._storage(self.contract, self.ptr_add(ptr, 5)) == self.xhex(10 ** 18) # Minimum amount
        # assert self._storage(self.contract, self.ptr_add(ptr, 6)) == None # Last price
        # assert self._storage(self.contract, self.ptr_add(ptr, 7)) == "0x" + self.ALICE['address'] # Owner
        # assert self._storage(self.contract, self.ptr_add(ptr, 8)) == None # Block #


    def test_change_ownership(self):
        self.test_initialize()

        new_owner = "0xf9e57456f18d90886263fedd9cc30b27cd959137"

        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            0,
            funid=self.CHANGE_OWNERSHIP,
            abi=[new_owner])
        assert ans == [1]
        assert self._storage(self.contract, "0x01") == new_owner

    def test_get_market(self):
        self.test_initialize()

        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            0,
            funid=self.GET_MARKET,
            abi=[1])
        self.state.mine(3)

        assert ans == [1, 4543576, 584202455294917676171628316407181071088652546483L, 5, 100000000, 1000000000000000000, 1, 745948140856946866108753121277737810491401257713L, 0, 0]


    #
    # ETX
    #
    def test_alice_to_bob(self):
        self.test_initialize()

        # Send 1000 to Bob
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=0,
            abi=[self.BOB['address'], 1000 * 10 ** 5])
        assert ans == [1]

        # Alice has 1000 less
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=1,
            abi=[self.ALICE['address']])
        assert ans == [1000000 * 10 ** 5 - 1000 * 10 ** 5]

        # Bob has 1000
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=1,
            abi=[self.BOB['address']])
        assert ans == [1000 * 10 ** 5]

        # assert self._storage(self.etx_contract, int(self.ALICE['address'], 16)) == self.xhex(1000000 - 1000)
        # assert self._storage(self.etx_contract, int(self.BOB['address'], 16)) == self.xhex(1000)

    def test_bob_to_charlie_invalid(self):
        self.test_initialize()

        ans = self.state.send(
            self.BOB['key'],
            self.etx_contract,
            0,
            funid=0,
            abi=[self.CHARLIE['address'], 1000 * 10 ** 5])
        assert ans == [0]

    def test_alice_to_bob_to_charlie_valid(self):
        self.test_initialize()

        # Send 1000 to Bob
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=0,
            abi=[self.BOB['address'], 1000 * 10 ** 5])
        assert ans == [1]

        # Bob sends 250 to Charlie
        ans = self.state.send(
            self.BOB['key'],
            self.etx_contract,
            0,
            funid=0,
            abi=[self.CHARLIE['address'], 250 * 10 ** 5])
        assert ans == [1]

        # Charlie now has 250
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=1,
            abi=[self.CHARLIE['address']])
        assert ans == [250 * 10 ** 5]


    #
    # Balances
    #

    def test_deposit_to_exchange(self, init=True):
        if init:
            self.test_initialize()

        # Deposit 1000 into exchange
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=0,
            abi=[self.contract, 1000 * 10 ** 5])
        assert ans == [1]

        # Alice has 1000 less
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=1,
            abi=[self.ALICE['address']])
        assert ans == [1000000 * 10 ** 5 - 1000 * 10 ** 5]

        # Exchange has 1000
        ans = self.state.send(
            self.ALICE['key'],
            self.etx_contract,
            0,
            funid=1,
            abi=[self.contract])
        assert ans == [1000 * 10 ** 5]

        # Alice has 1000 in the exchange
        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            0,
            funid=self.GET_SUB_BALANCE,
            abi=[self.ALICE['address'], 1])
        assert ans == [1000 * 10 ** 5]

    # def test_withdraw_eth(self):
    #     self.test_deposit_eth()

    #     ans = self.state.send(self.ALICE['key'], self.contract, 0, [5, 1 * 10 ** 17])
    #     assert ans == [1]
    #     assert self._storage(self.bcontract, int(self.ALICE['address'], 16)) == self.xhex(10 ** 18)

    # def test_withdraw_eth_invalid(self):
    #     self.test_initialize()

    #     ans = self.state.send(self.ALICE['key'], self.contract, 0, [5, 10 ** 19])
    #     assert ans == [0]


    #
    # Trades
    #

    def test_add_buy_trades(self):
        self.test_initialize()

        # Add buy trade
        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            125 * 10 ** 18,
            funid=self.BUY,
            abi=[500 * 10 ** 5, int(0.25 * 10 ** 8), 1])
        assert ans == [23490291715255176443338864873375620519154876621682055163056454432194948412040L]

        # Another buy trade
        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            150 * 10 ** 18,
            funid=self.BUY,
            abi=[600 * 10 ** 5, int(0.25 * 10 ** 8), 1])
        assert ans == [-35168633768494065610302920664120686116555617894816459733689825088489895266148L]

    def test_trade_already_exists(self):
        self.test_add_buy_trades()

        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            125 * 10 ** 18,
            funid=self.BUY,
            abi=[500 * 10 ** 5, int(0.25 * 10 ** 8), 1])
        assert ans == [15]

    def test_add_sell_trades(self, init=True):
        self.test_deposit_to_exchange(init)

        # Add sell trade
        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            0,
            funid=self.SELL,
            abi=[500 * 10 ** 5, int(0.25 * 10 ** 8), 1])
        assert ans == [49800558551364658298467690253710486242473574128865389798518930174170604985043L]

        logger.info("Storage after adding trades:")
        logger.info(self.state.block.account_to_dict(self.contract)['storage'])
        logger.info("===")

    def test_get_trade_ids(self):
        self.test_add_buy_trades()
        self.test_add_sell_trades(False)

        ans = self.state.send(
            self.ALICE['key'],
            self.contract,
            0,
            funid=self.GET_TRADE_IDS,
            abi=[1])
        assert ans == [
            23490291715255176443338864873375620519154876621682055163056454432194948412040L,
            -35168633768494065610302920664120686116555617894816459733689825088489895266148L,
            49800558551364658298467690253710486242473574128865389798518930174170604985043L]



    #
    # EtherEx
    #
    def test_no_data(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [])

        assert ans == [0]

    def test_invalid_operation(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=99, abi=[0])

        assert ans == []

    def test_missing_amount(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=1, abi=[0, int(0.25 * 10 ** 8), 1])

        assert ans == [2]

    def test_missing_price(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=1, abi=[1000 * 10 ** 5, 0, 1])

        assert ans == [3]

    def test_missing_market_id(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=1, abi=[1000 * 10 ** 5, int(0.25 * 10 ** 8), 0])

        assert ans == [4]

    def test_too_many_arguments(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=1, abi=[1000 * 10 ** 5, int(0.25 * 10 ** 8), 1, 1])

        assert ans == [12] # ETH value not met?

    def test_amount_out_of_range(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=1, abi=[2 ** 255, int(0.25 * 10 ** 8), 1])

        assert ans == [12] # ETH value not met?

    def test_price_out_of_range(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, funid=1, abi=[1000 * 10 ** 5, 2 ** 255, 1])

        assert ans == [12] # ETH value not met?

    def test_add_bob_coin(self):
        self.test_initialize()

        # Register BOBcoin
        ans = self.state.send(
            self.BOB['key'],
            self.contract,
            10 ** 18,
            funid=self.ADD_MARKET,
            abi=["0x" + "BOB".encode('hex'), self.bob_contract, 4, 10 ** 8, 10 ** 18])
        assert ans == [1]

        # Set exchange address in BOB contract
        ans = self.state.send(
            self.BOB['key'],
            self.bob_contract,
            0,
            funid=2,
            abi=[self.contract])
        assert ans == [1]
        assert self._storage(self.bob_contract, self.xhex(1)) == "0x" + self.contract

        # ans = self.state.send(self.BOB['key'], self.contract, 10 * 10 ** 18, [7, "BOB", self.BOB['address'], 4, 10 ** 18, 10 ** 5]) # AKA BobScam, TODO regulations! j/k...

        # assert ans == [2]
        # assert self._storage(self.contract, 110) == "0x" + "BOB".encode('hex')
        # assert self._storage(self.contract, 111) == "0x" + self.BOB['address']
        # assert self._storage(self.contract, 112) == self.xhex(4)
        # assert self._storage(self.contract, 113) == self.xhex(10 ** 18)
        # assert self._storage(self.contract, 114) == self.xhex(10 ** 5)
        # assert self._storage(self.contract, 115) == None
        # assert self._storage(self.contract, 116) == self.xhex(2)

    def test_check_bob_coin(self):
        self.test_add_bob_coin()

        ans = self.state.send(self.ALICE['key'], self.contract, 125 * 10 ** 18, [1, 500 * 10 ** 4, int(0.25 * 10 ** 5), 2])
        assert ans == [100] #[int("ETH/BOB".encode('hex'), 16)]
        assert self._storage(self.tcontract, 100) == self.xhex(1)
        assert self._storage(self.tcontract, 101) == self.xhex(int(0.25 * 10 ** 5))
        assert self._storage(self.tcontract, 102) == self.xhex(500 * 10 ** 4)
        assert self._storage(self.tcontract, 103) == "0x" + self.ALICE['address']
        assert self._storage(self.tcontract, 104) == self.xhex(2)

    # TODO - Move to X-Chain tests
    # # def test_insufficient_btc_trade(self):
    # #     tx = Tx(sender='alice', value=0, data=[1, 1 * 10 ** 6, 1000 * 10 ** 8, 1])
    # #     self.run(tx, self.contract)
    # #     assert self.stopped == 12 #.startswith("Minimum BTC trade amount not met")
    # #     assert self.contract.storage[1] == 1

    def test_insufficient_buy_trade(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 10 ** 17, [1, 500 * 10 ** 5, int(0.25 * 10 ** 8), 1])

        assert ans == [12] #.startswith("Minimum ETX trade amount not met")

    def test_insufficient_sell_trade(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [2, 500 * 10 ** 5, int(0.25 * 10 ** 2), 1])
        assert ans == [12] #.startswith("Minimum ETH value not met")

    def test_insufficient_mismatch_buy_trade(self):
        self.test_initialize()

        ans = self.state.send(self.BOB['key'], self.contract, 124 * 10 ** 18, [1, 500 * 10 ** 5, int(0.25 * 10 ** 8), 1])
        assert ans == [13] #.startswith("Minimum ETH value not met")

        # TODO - Check market recorded last price
        # assert self._storage(self.contract, 115) == 1000 * 10 ** 8


    #
    # Trades
    #
    def test_first_buy(self):
        self.test_initialize()

        self.initial_balance = self.state.block.get_balance(self.ALICE['address'])

        ans = self.state.send(self.ALICE['key'], self.contract, 125 * 10 ** 18, [1, 500 * 10 ** 5, int(0.25 * 10 ** 8), 1])

        assert ans == [100]
        assert self._storage(self.tcontract, 100) == self.xhex(1)
        assert self._storage(self.tcontract, 101) == self.xhex(int(0.25 * 10 ** 8))
        assert self._storage(self.tcontract, 102) == self.xhex(500 * 10 ** 5)
        assert self._storage(self.tcontract, 103) == "0x" + self.ALICE['address']
        assert self._storage(self.tcontract, 104) == self.xhex(1)

    def test_linked_list_pointers_after_first_trade(self):
        self.test_first_buy()

        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(100)
        assert self._storage(self.tcontract, 108) == self.xhex(100) # first trade's previous should point to itself
        assert self._storage(self.tcontract, 109) == self.xhex(110) # first trade's next should point to next available slot

    def test_cancel_trade_invalid(self):
        self.test_first_buy()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [6, 100])
        assert ans == [0]

    def test_cancel_trade(self):
        self.test_first_buy()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [6, 100])

        assert ans == [1]
        for x in xrange(100,109):
            assert self._storage(self.tcontract, x) == None
        assert self.state.block.get_balance(self.ALICE['address']) == self.initial_balance
        assert len(self.state.block.get_transactions()) == 17

    def test_linked_list_pointers_after_cancel_single_trade(self):
        self.test_first_buy()

        ans = self.state.send(self.ALICE['key'], self.contract, 0, [6, 100])

        assert ans == [1]
        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(100)
        assert self._storage(self.tcontract, 108) == None # cancelled trade's previous should be empty
        assert self._storage(self.tcontract, 109) == None # cancelled trade's next should be empty

    def test_second_buy(self):
        self.test_first_buy()

        ans = self.state.send(self.BOB['key'], self.contract, 100 * 10 ** 18, [1, 500 * 10 ** 5, int(0.2 * 10 ** 8), 1])

        assert ans == [110]
        assert self._storage(self.tcontract, 110) == self.xhex(1)
        assert self._storage(self.tcontract, 111) == self.xhex(int(0.2 * 10 ** 8))
        assert self._storage(self.tcontract, 112) == self.xhex(500 * 10 ** 5)
        assert self._storage(self.tcontract, 113) == "0x" + self.BOB['address']
        assert self._storage(self.tcontract, 114) == self.xhex(1)

    def test_linked_list_pointers_after_second_trade(self):
        self.test_second_buy()

        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(110)
        assert self._storage(self.tcontract, 118) == self.xhex(100) # second trade's previous should point to first trade
        assert self._storage(self.tcontract, 119) == self.xhex(120) # second trade's next should point to next available slot

    def test_linked_list_pointers_after_cancel_second_trade(self):
        self.test_second_buy()

        ans = self.state.send(self.BOB['key'], self.contract, 0, [6, 110])

        assert ans == [1]
        for x in xrange(110,119):
            assert self._storage(self.tcontract, x) == None
        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(100)
        assert self._storage(self.tcontract, 108) == self.xhex(100) # first trade's previous should point to itself
        assert self._storage(self.tcontract, 109) == self.xhex(110) # first trade's next should point to next available slot

    def test_first_sell(self):
        self.test_second_buy()

        # Load CHARLIE with ETX from ALICE
        ans = self.state.send(self.ALICE['key'], self.etx_contract, 0, [self.CHARLIE['address'], 10 ** 18 - 1000])
        assert ans == [1]

        ans = self.state.send(self.CHARLIE['key'], self.contract, 0, [2, 500 * 10 ** 5, int(0.25 * 10 ** 8), 1])

        assert ans == [120]
        assert self._storage(self.tcontract, 120) == self.xhex(2) # TODO status
        assert self._storage(self.tcontract, 121) == self.xhex(int(0.25 * 10 ** 8))
        assert self._storage(self.tcontract, 122) == self.xhex(500 * 10 ** 5)
        assert self._storage(self.tcontract, 123) == "0x" + self.CHARLIE['address']
        assert self._storage(self.tcontract, 124) == self.xhex(1)
        # TODO - proper balance assertions

    def test_linked_list_pointers_after_third_trade(self):
        self.test_first_sell()

        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(120)
        assert self._storage(self.tcontract, 128) == self.xhex(110) # third trade's previous should point to second trade
        assert self._storage(self.tcontract, 129) == self.xhex(130) # third trade's next should point to next available slot

    def test_basic_hft_prevention_using_block_number_fail(self):
        self.state.mine(1)
        self.test_first_buy()

        # Load BOB with ETX from ALICE
        ans = self.state.send(self.ALICE['key'], self.etx_contract, 125 * 10 ** 18, [self.BOB['address'], 10 ** 18 - 1000])
        assert ans == [1]

        assert self._storage(self.tcontract, 107) == self.xhex(self.state.block.number)

        ans = self.state.send(self.BOB['key'], self.contract, 0, [3, 100])
        assert ans == [14]

    def test_basic_hft_prevention_using_block_number(self):
        self.test_basic_hft_prevention_using_block_number_fail()
        self.state.mine(1)

        assert self._storage(self.tcontract, 107) == self.xhex(self.state.block.number - 1)

        ans = self.state.send(self.BOB['key'], self.contract, 0, [3, 100])
        assert ans == [1]


    def test_fulfill_first_buy_with_sell(self):
        self.test_first_buy()
        self.state.mine(1)

        # Load BOB with ETX from ALICE
        ans = self.state.send(self.ALICE['key'], self.etx_contract, 0, [self.BOB['address'], 10 ** 18 - 1000])
        assert ans == [1]

        ans = self.state.send(self.BOB['key'], self.contract, 0, [3, 100])
        assert ans == [1]
        for x in xrange(100,109):
            assert self._storage(self.tcontract, x) == None
        # TODO - proper balance assertions

    def test_linked_list_pointers_after_single_trade_fulfillment(self):
        self.test_fulfill_first_buy_with_sell()

        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(100)

    def test_fulfill_first_buy_with_sell_after_second_trade(self):
        self.test_second_buy()
        self.state.mine(1)

        # Load BOB with ETX from ALICE
        ans = self.state.send(self.ALICE['key'], self.etx_contract, 0, [self.BOB['address'], 10 ** 18 - 1000])
        assert ans == [1]

        ans = self.state.send(self.BOB['key'], self.contract, 0, [3, 100])
        assert ans == [1]
        for x in xrange(100,109):
            assert self._storage(self.tcontract, x) == None

    def test_linked_list_pointers_after_first_trade_fulfillment(self):
        self.test_fulfill_first_buy_with_sell_after_second_trade()

        assert self._storage(self.tcontract, 18) == self.xhex(110)
        assert self._storage(self.tcontract, 19) == self.xhex(110)
        assert self._storage(self.tcontract, 118) == self.xhex(110) # second trade's previous should point to itself
        assert self._storage(self.tcontract, 119) == self.xhex(120) # second trade's next should point to next available slot

    def test_fulfill_first_sell_with_buy_and_check_pointers(self):
        self.test_first_sell()
        self.state.mine(1)

        ans = self.state.send(self.BOB['key'], self.contract, 125 * 10 ** 18, [3, 120])
        assert ans == [1]
        for x in xrange(120,129):
            assert self._storage(self.tcontract, x) == None
        assert self._storage(self.tcontract, 18) == self.xhex(100)
        assert self._storage(self.tcontract, 19) == self.xhex(110)
        assert self._storage(self.tcontract, 118) == self.xhex(100) # previous trade's previous should point to first trade
        assert self._storage(self.tcontract, 119) == self.xhex(120) # previous trade's next should point to this trade

    def test_fulfill_first_trade_after_third_trade_and_check_pointers(self):
        self.test_first_sell()
        self.state.mine(1)

        # Load BOB with ETX from ALICE
        # ans = self.state.send(self.ALICE['key'], self.etx_contract, 10 ** 18, [self.BOB['address'], 10 ** 18 - 1000])
        # assert ans == [1]

        ans = self.state.send(self.CHARLIE['key'], self.contract, 0, [3, 100])
        assert ans == [1]
        for x in xrange(100,109):
            assert self._storage(self.tcontract, x) == None
        assert self._storage(self.tcontract, 18) == self.xhex(110)
        assert self._storage(self.tcontract, 19) == self.xhex(120)
        assert self._storage(self.tcontract, 118) == self.xhex(110) # previous trade's previous should point to itself
        assert self._storage(self.tcontract, 119) == self.xhex(120) # previous trade's next should point to third trade

    def test_set_last_price(self):
        self.test_fulfill_first_trade_after_third_trade_and_check_pointers()
        self.state.mine(1)

        assert self._storage(self.contract, 105) == self.xhex(int(0.25 * 10 ** 8))

        ans = self.state.send(self.ALICE['key'], self.contract, 0, ["price", 1])

        assert ans == [int(0.25 * 10 ** 8)]

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