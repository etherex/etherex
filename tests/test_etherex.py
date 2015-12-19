# etherex.py -- EtherEx tests
#
# Copyright (c) 2014 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

import pytest
from ethereum import tester
from ethereum import utils
import logging

logger = logging.getLogger(__name__)

# DEBUG
tester.disable_logging()
logger.setLevel("INFO")

# Boolean success/failure
SUCCESS = 1
FAILURE = 0

# Error codes
MISSING_AMOUNT = 2
MISSING_PRICE = 3
MISSING_MARKET_ID = 4

INSUFFICIENT_BALANCE = 11
INSUFFICIENT_TRADE_AMOUNT = 12
INSUFFICIENT_VALUE = 13

TRADE_AMOUNT_MISMATCH = 14
TRADE_ALREADY_EXISTS = 15

SAME_BLOCK_TRADE_PROHIBITED = 16

FEE_PER_TRADE = 200000


class TestEtherEx(object):

    ALICE = {'address': tester.a0.encode('hex'), 'key': tester.k0}
    BOB = {'address': tester.a1.encode('hex'), 'key': tester.k1}
    CHARLIE = {'address': tester.a2.encode('hex'), 'key': tester.k2}

    # NameReg
    namereg = 'contracts/namereg.se'

    # EtherEx contracts
    etherex = 'contracts/etherex.se'
    # standard = 'contracts/Standard_Token.sol'  # TODO
    etx = 'contracts/etx.se'
    bob = 'contracts/etx.se'

    # Utilities
    def hex_pad(self, x):
        return "{0:#0{1}x}".format(x, 66)

    def xhex(self, x):
        value = "{0:#x}".format(x)
        if len(value) % 2 != 0:
            value = "0x0" + value[2:]
        return value

    def _storage(self, contract, idx):
        return self.state.block.account_to_dict(contract.address)['storage'].get(idx)

    # Setup
    def setup_class(self):
        self.state = tester.state()

        self.namereg = self.state.abi_contract(self.namereg)

        self.contract = self.state.abi_contract(self.etherex, gas=3000000)

        self.etx_contract = self.state.abi_contract(self.etx, endowment=10 ** 21, sender=tester.k3)
        assert self.etx_contract.setExchange(tester.a3, sender=tester.k3) == 1
        assert self.etx_contract.issue(1000000 * 10 ** 5, tester.a0, sender=tester.k3) == 1
        assert self.etx_contract.setExchange(self.contract.address, sender=tester.k3) == 1

        self.bob_contract = self.state.abi_contract(self.bob, endowment=10 ** 21, sender=tester.k4)
        assert self.bob_contract.setExchange(tester.a4, sender=tester.k4) == 1
        assert self.bob_contract.issue(1000000 * 10 ** 5, tester.a0, sender=tester.k4) == 1
        assert self.bob_contract.setExchange(self.contract.address, sender=tester.k4) == 1

        # TODO Test Solidity Standard Token
        # self.standard_contract = self.state.abi_contract(open(self.standard).read(), language='solidity')

        self.snapshot = self.state.snapshot()

    def setup_method(self, method):
        self.state.revert(self.snapshot)
        tester.seed = 3 ** 160  # use fixed testing seed

    # Tests
    def test_creation(self):
        assert self._storage(self.contract, "0x") is None

        assert self.etx_contract.balanceOf(self.ALICE['address']) == 1000000 * 10 ** 5
        assert self.bob_contract.balanceOf(self.ALICE['address']) == 1000000 * 10 ** 5

    def test_initialize(self, block=None):
        # NameReg Alice
        ans = self.namereg.register(self.ALICE['address'], "Alice")
        assert ans == SUCCESS
        assert self._storage(self.namereg, "0x" + self.ALICE['address']) == "0x" + "Alice".encode('hex')
        assert self.namereg.getname(self.ALICE['address']) == utils.big_endian_to_int("Alice")

        # NameReg EtherEx
        ans = self.namereg.register(self.contract.address, "EtherEx")
        assert ans == SUCCESS
        assert self._storage(self.namereg, "0x" + self.contract.address.encode('hex')) == "0x" + "EtherEx".encode('hex')

        # NameReg ETX
        ans = self.namereg.register(self.etx_contract.address, "ETX")
        assert ans == SUCCESS
        assert self._storage(self.namereg, "0x" + self.etx_contract.address.encode('hex')) == "0x" + "ETX".encode('hex')

        # Register ETX
        ans = self.contract.add_market(
            "ETX",
            self.etx_contract.address,
            5,
            10 ** 8,
            10 ** 18,
            1,
            sender=self.ALICE['key'])
        assert ans == SUCCESS

        # TODO Register Solidity Standard Token
        # ans = self.contract.add_market(
        #     "SST",
        #     self.standard_contract.address,
        #     5,
        #     10 ** 8,
        #     10 ** 18,
        #     1,
        #     sender=self.ALICE['key'])
        # assert ans == 1

    def test_get_last_market_id(self):
        self.test_initialize()

        ans = self.contract.get_last_market_id()
        assert ans == 1

    def test_get_market_id(self):
        self.test_initialize()

        assert self.contract.get_market_id(self.etx_contract.address) == 1

    def test_get_market(self):
        self.test_initialize()

        ans = self.contract.get_market(1)

        assert ans == [
            1,
            4543576,
            623629443112573850082355318437672870999946689283L,
            5,
            100000000,
            1000000000000000000,
            1,
            745948140856946866108753121277737810491401257713L,
            0,
            0,
            1]

    #
    # ETX
    #
    def test_alice_to_bob(self):
        self.test_initialize()

        # Send 1000 to Bob
        ans = self.etx_contract.transfer(self.BOB['address'], 1000 * 10 ** 5)
        assert ans == SUCCESS

        # Alice has 1000 less
        ans = self.etx_contract.balanceOf(self.ALICE['address'])
        assert ans == 1000000 * 10 ** 5 - 1000 * 10 ** 5

        # Bob has 1000
        ans = self.etx_contract.balanceOf(self.BOB['address'])
        assert ans == 1000 * 10 ** 5

        # assert self._storage(self.etx_contract, int(self.ALICE['address'], 16)) == self.xhex(1000000 - 1000)
        # assert self._storage(self.etx_contract, int(self.BOB['address'], 16)) == self.xhex(1000)

    def test_bob_to_charlie_fail(self):
        self.test_initialize()

        ans = self.etx_contract.transfer(self.CHARLIE['address'], 1000 * 10 ** 5, sender=self.BOB['key'])
        assert ans == FAILURE

    def test_alice_to_bob_to_charlie(self):
        self.test_initialize()

        # Send 1000 to Bob
        ans = self.etx_contract.transfer(self.BOB['address'], 1000 * 10 ** 5, profiling=1)
        assert ans['output'] == 1
        logger.info("\nTransfer profiling: %s" % ans)

        # Bob sends 250 to Charlie
        ans = self.etx_contract.transfer(self.CHARLIE['address'], 250 * 10 ** 5, sender=self.BOB['key'])
        assert ans == SUCCESS

        # Charlie now has 250
        ans = self.etx_contract.balanceOf(self.CHARLIE['address'])
        assert ans == 250 * 10 ** 5

    #
    # Balances
    #
    def test_sub_balance(self):
        self.test_initialize()

        ans = self.etx_contract.balanceOf(self.ALICE['address'])
        assert ans == 1000000 * 10 ** 5

    def test_deposit_to_exchange(self, init=True):
        if init:
            self.test_initialize()

        # Approve deposit of 10,000
        ans = self.etx_contract.approve(
            self.contract.address,
            10000 * 10 ** 5,
            profiling=1)
        assert ans['output'] == 1
        logger.info("\napprove profiling: %s" % ans)

        # Verify exchange is approved for a transfer
        ans = self.etx_contract.allowance(
            self.ALICE['address'],
            self.contract.address)
        assert ans == 10000 * 10 ** 5

        # Deposit 10,000 into exchange
        ans = self.contract.deposit(10000 * 10 ** 5, 1, profiling=1)
        assert ans['output'] == 1000000000
        logger.info("\nDeposit profiling: %s" % ans)

        # Verify exchange is no longer approved for a transfer
        ans = self.etx_contract.allowance(
            self.ALICE['address'],
            self.contract.address)
        assert ans == FAILURE

        # Alice has 10,000 less
        ans = self.etx_contract.balanceOf(self.ALICE['address'])
        assert ans == 1000000 * 10 ** 5 - 10000 * 10 ** 5

        # Exchange has 10,000
        ans = self.etx_contract.balanceOf(self.contract.address)
        assert ans == 10000 * 10 ** 5

        # Alice has 10,000 in the exchange
        ans = self.contract.get_sub_balance(self.ALICE['address'], 1)
        assert ans == [10000 * 10 ** 5, 0]

    def test_log_deposit(self):
        snapshot = self.state.snapshot()
        o = []
        self.state.block.log_listeners.append(lambda x: o.append(self.contract._translator.listen(x)))

        self.test_deposit_to_exchange()

        assert o == [
            {
                '_event_type': 'log_market', 'id': 1
            },
            None,  # Token contract events returning None...
            None,
            {
                "_event_type": "log_deposit",
                "market": 1,
                "sender": int("0x" + self.ALICE['address'], 16),
                "amount": 10000 * 10 ** 5
            }
        ]
        self.state.revert(snapshot)

    def test_withdraw_sub_fail(self):
        self.test_initialize()

        ans = self.contract.withdraw(1000 * 10 ** 5, 1)
        assert ans == 0

    def test_withdraw_sub(self):
        self.test_deposit_to_exchange()

        ans = self.contract.withdraw(1000 * 10 ** 5, 1, profiling=1)
        assert ans['output'] == 1
        logger.info("\nWithdraw profiling: %s" % ans)

    #
    # EtherEx
    #
    def test_no_data(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract.address, 0, "0")

        assert ans == ''

    def test_invalid_operation(self):
        self.test_initialize()

        ans = self.state.send(self.ALICE['key'], self.contract.address, 0, "0xFF")

        assert ans == ''

    def test_missing_amount(self):
        self.test_initialize()

        ans = self.contract.buy(0, int(0.25 * 10 ** 8), 1)

        assert ans == 2

    def test_missing_price(self):
        self.test_initialize()

        ans = self.contract.buy(1000 * 10 ** 5, 0, 1)

        assert ans == 3

    def test_missing_market_id(self):
        self.test_initialize()

        ans = self.contract.buy(1000 * 10 ** 5, int(0.25 * 10 ** 8), 0)

        assert ans == 4

    def test_too_many_arguments(self):
        self.test_initialize()

        with pytest.raises(Exception) as excinfo:
            self.contract.buy(1000 * 10 ** 5, int(0.25 * 10 ** 8), 1, 1)
        assert "list index out of range" in excinfo.value.message

    def test_amount_out_of_range(self):
        self.test_initialize()

        with pytest.raises(Exception) as excinfo:
            self.contract.buy(2 ** 256, int(0.25 * 10 ** 8), 1)
        assert 'Number out of range' in excinfo.value.message

    def test_price_out_of_range(self):
        self.test_initialize()

        with pytest.raises(Exception) as excinfo:
            self.contract.buy(1000 * 10 ** 5, 2 ** 256, 1)
        assert 'Number out of range' in excinfo.value.message

    def test_add_bob_coin(self):
        self.test_initialize()

        # Register BOBcoin
        ans = self.contract.add_market(
            "BOB",
            self.bob_contract.address,
            4,
            10 ** 8,
            10 ** 18,
            1,
            sender=self.BOB['key'],
            profiling=1)
        assert ans['output'] == 1
        logger.info("\nAdd other market profiling: %s" % ans)

    def test_get_bob_market_id(self):
        self.test_add_bob_coin()

        assert self.contract.get_market_id(self.bob_contract.address) == 2

    def test_get_new_last_market_id(self):
        self.test_add_bob_coin()

        assert self.contract.get_last_market_id() == 2

    def test_insufficient_buy_trade(self):
        self.test_initialize()

        ans = self.contract.buy(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=10 ** 17)
        assert ans == 12

    def test_insufficient_sell_trade(self):
        self.test_initialize()

        ans = self.contract.sell(500 * 10 ** 5, int(0.25 * 10 ** 2), 1)
        assert ans == 12

    def test_insufficient_mismatch_buy_trade(self):
        self.test_initialize()

        ans = self.contract.buy(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, sender=self.BOB['key'], value=124 * 10 ** 18)
        assert ans == 14

    #
    # Trades
    #

    def test_add_buy_trades(self):
        self.test_initialize()

        self.initial_balance = self.state.block.get_balance(self.ALICE['address'])

        # Add buy trade
        ans = self.contract.buy(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=125 * 10 ** 18, profiling=1)
        assert ans['output'] == 23490291715255176443338864873375620519154876621682055163056454432194948412040L
        logger.info("\nAdd buy profiling: %s" % ans)

        # Another buy trade
        ans = self.contract.buy(600 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=150 * 10 ** 18, profiling=1)
        assert ans['output'] == -35168633768494065610302920664120686116555617894816459733689825088489895266148L
        logger.info("\nAdd 2nd buy profiling: %s" % ans)

        # And another
        ans = self.contract.buy(700 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=175 * 10 ** 18, profiling=1)
        assert ans['output'] == 38936224262371094519907212029104196662516973526369593745812124922634258039407L
        logger.info("\nAdd 3rd buy profiling: %s" % ans)

        self.after_buy_balance = self.state.block.get_balance(self.ALICE['address'])
        assert self.after_buy_balance < self.initial_balance

    def test_get_trade(self):
        self.test_add_buy_trades()

        ans = self.contract.get_trade(23490291715255176443338864873375620519154876621682055163056454432194948412040L)
        assert ans == [
            23490291715255176443338864873375620519154876621682055163056454432194948412040L,
            1L,
            1L,
            50000000L,
            25000000L,
            745948140856946866108753121277737810491401257713L,
            0L,
            -43661844752590979300431051011371330267999218421176783949151853302739548924863L]

    def test_trade_already_exists(self):
        self.test_add_buy_trades()

        ans = self.contract.buy(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=125 * 10 ** 18)
        assert ans == 15

    def test_add_sell_trades(self, init=True):
        self.test_deposit_to_exchange(init)

        # Add sell trade
        ans = self.contract.sell(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, profiling=1)
        assert ans['output'] == 49800558551364658298467690253710486242473574128865389798518930174170604985043L
        logger.info("\nAdd sell profiling: %s" % ans)

        ans = self.contract.sell(600 * 10 ** 5, int(0.25 * 10 ** 8), 1, profiling=1)
        assert ans['output'] == -34362698062012420373581910342777892308255636544894323695139344222373572831032L
        logger.info("\nAdd 2nd sell profiling: %s" % ans)

        ans = self.contract.sell(700 * 10 ** 5, int(0.25 * 10 ** 8), 1, profiling=1)
        assert ans['output'] == -11872296793322400290999375245896441639313038086627719556596606178564438289113L
        logger.info("\nAdd 3rd sell profiling: %s" % ans)

        # logger.info("\nStorage after adding trades:")
        # logger.info(self.state.block.account_to_dict(self.contract.address)['storage'])
        # logger.info("\n===")

    def test_get_trade_ids(self):
        self.test_add_buy_trades()
        self.test_add_sell_trades(False)

        ans = self.contract.get_trade_ids(1)
        assert ans == [
            -11872296793322400290999375245896441639313038086627719556596606178564438289113L,
            -34362698062012420373581910342777892308255636544894323695139344222373572831032L,
            49800558551364658298467690253710486242473574128865389798518930174170604985043L,
            38936224262371094519907212029104196662516973526369593745812124922634258039407L,
            -35168633768494065610302920664120686116555617894816459733689825088489895266148L,
            23490291715255176443338864873375620519154876621682055163056454432194948412040L]

    def test_cancel_trade_fail(self):
        self.test_add_buy_trades()

        ans = self.contract.cancel(
            23490291715255176443338864873375620519154876621682055163056454432194948412040L,
            sender=self.BOB['key'])
        assert ans == 0

    def test_cancel_trade(self):
        self.test_add_buy_trades()

        ans = self.contract.cancel(23490291715255176443338864873375620519154876621682055163056454432194948412040L, profiling=1)
        assert ans['output'] == 1
        logger.info("\nCancel profiling: %s" % ans)
        assert self.state.block.get_balance(self.ALICE['address']) > self.after_buy_balance

        ans = self.contract.get_trade(23490291715255176443338864873375620519154876621682055163056454432194948412040L)
        assert ans == [0, 0, 0, 0, 0, 0, 0, 0]

    def test_basic_hft_prevention_using_block_number_fail(self):
        self.test_add_buy_trades()

        # Try to fill a pending transaction and fail
        ans = self.contract.trade(
            500 * 10 ** 5,
            [23490291715255176443338864873375620519154876621682055163056454432194948412040L],
            sender=self.BOB['key'])
        assert ans == 16

    def test_fulfill_first_buy_fail(self):
        self.test_add_buy_trades()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        ans = self.contract.trade(
            500 * 10 ** 5,
            [23490291715255176443338864873375620519154876621682055163056454432194948412040L],
            sender=self.BOB['key'])
        assert ans == 11
        self.state.revert(snapshot)

    def test_fulfill_first_sell_fail(self):
        self.test_add_sell_trades()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        ans = self.contract.trade(
            500 * 10 ** 5,
            [49800558551364658298467690253710486242473574128865389798518930174170604985043L])
        assert ans == 11
        self.state.revert(snapshot)

    def test_transfer_to_bob_and_deposit(self):
        # Load BOB with ETX from ALICE
        ans = self.etx_contract.transfer(self.BOB['address'], 10000 * 10 ** 5)
        assert ans == 1

        # Get BOB's balance
        balance = self.state.block.get_balance(self.BOB['address'])
        assert balance == 10 ** 24

        # Approve deposit of 10,000
        ans = self.etx_contract.approve(
            self.contract.address,
            10000 * 10 ** 5,
            sender=self.BOB['key'])

        # Verify exchange is approved for a transfer
        ans = self.etx_contract.allowance(
            self.BOB['address'],
            self.contract.address)
        assert ans == 10000 * 10 ** 5

        o = []
        self.state.block.log_listeners.append(lambda x: o.append(self.contract._translator.listen(x)))

        # Deposit 10,000 into exchange
        depositFailed = False
        try:  # FIXME - tx shouldn't fail... pyethereum.tester WTF
            ans = self.contract.deposit(
                10000 * 10 ** 5,
                1,
                sender=self.BOB['key'],
                profiling=1)
            assert ans['output'] == 1000000000
        except Exception as e:
            logger.warning("%s" % e)
            depositFailed = True
            pass
        logger.info("\n2nd Deposit profiling: %s" % ans)

        # Verify exchange is no longer approved for a transfer
        if not depositFailed:
            ans = self.etx_contract.allowance(
                self.BOB['address'],
                self.contract.address)
            assert ans == 0
            assert o == [None, {
                "_event_type": "log_deposit",
                "market": 1,
                "sender": int("0x" + self.BOB['address'], 16),
                "amount": 10000 * 10 ** 5
            }]
        else:
            ans = self.etx_contract.allowance(
                self.BOB['address'],
                self.contract.address)
            assert ans == 1000000000

        # Set deposit_cost
        self.deposit_cost = balance - self.state.block.get_balance(self.BOB['address'])

    def test_fulfill_first_buy(self, revert=True):
        self.test_add_buy_trades()
        self.test_transfer_to_bob_and_deposit()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        # Fill first trade
        ans = self.contract.trade(
            500 * 10 ** 5,
            [23490291715255176443338864873375620519154876621682055163056454432194948412040L],
            sender=self.BOB['key'],
            profiling=1)
        assert ans['output'] == 1
        logger.info("\nFill buy profiling: %s" % ans)

        ans = self.contract.get_trade(23490291715255176443338864873375620519154876621682055163056454432194948412040L)
        assert ans == [0, 0, 0, 0, 0, 0, 0, 0]

        if revert:
            self.state.revert(snapshot)
        else:
            return snapshot
        # TODO - proper balance assertions

    def test_get_trade_ids_after_first_buy(self):
        snapshot = self.test_fulfill_first_buy(False)

        ans = self.contract.get_trade_ids(1)
        assert ans == [
            38936224262371094519907212029104196662516973526369593745812124922634258039407L,
            -35168633768494065610302920664120686116555617894816459733689825088489895266148L]
        self.state.revert(snapshot)

    def test_get_last_price(self):
        snapshot = self.test_fulfill_first_buy(False)
        # snapshot = self.state.snapshot()
        # self.state.mine(1)

        # assert self._storage(self.contract, 105) == self.xhex(int(0.25 * 10 ** 8))

        ans = self.contract.price(1)
        assert ans == int(0.25 * 10 ** 8)
        self.state.revert(snapshot)

    def test_log_add_deposit_fill_price(self):
        snapshot = self.state.snapshot()
        o = []
        self.state.block.log_listeners.append(lambda x: o.append(self.contract._translator.listen(x)))

        self.test_fulfill_first_buy(False)

        last_timestamp = self.state.block.timestamp

        assert o == [
            {
                '_event_type': 'log_market', 'id': 1
            }, {
                '_event_type': 'log_add_tx',
                'market': 1,
                'sender': 745948140856946866108753121277737810491401257713L,
                'type': 1,
                'amount': 50000000,
                'price': 25000000,
                'tradeid': 23490291715255176443338864873375620519154876621682055163056454432194948412040L
            }, {
                '_event_type': 'log_add_tx',
                'market': 1,
                'sender': 745948140856946866108753121277737810491401257713L,
                'type': 1,
                'price': 25000000,
                'amount': 60000000,
                'tradeid': -35168633768494065610302920664120686116555617894816459733689825088489895266148L
            }, {
                '_event_type': 'log_add_tx',
                'market': 1,
                'sender': 745948140856946866108753121277737810491401257713L,
                'type': 1,
                'price': 25000000,
                'amount': 70000000,
                'tradeid': 38936224262371094519907212029104196662516973526369593745812124922634258039407L
            },
            None,  # Token contract events returning None...
            None,
            None,
            {
                '_event_type': 'log_deposit',
                'market': 1,
                'sender': 715574669332965331462488905126228088406116900462L,
                'amount': 1000000000
            }, {
                '_event_type': 'log_fill_tx',
                'market': 1,
                'sender': 715574669332965331462488905126228088406116900462L,
                'owner': 745948140856946866108753121277737810491401257713L,
                'type': 2,
                'price': 25000000,
                'amount': 50000000,
                'tradeid': 23490291715255176443338864873375620519154876621682055163056454432194948412040L
            }, {
                '_event_type': 'log_price',
                'market': 1,
                'type': 1,
                'price': 25000000,
                'amount': 50000000,
                'timestamp': last_timestamp
            }
        ]
        self.state.revert(snapshot)

    def test_fulfill_first_sell(self, revert=True):
        self.test_add_sell_trades(revert)
        snapshot = self.state.snapshot()
        self.state.mine(1)

        fill_amount = 500 * 10 ** 5

        ans = self.contract.trade(
            fill_amount,
            [49800558551364658298467690253710486242473574128865389798518930174170604985043L],
            sender=self.BOB['key'],
            value=125 * 10 ** 18 + FEE_PER_TRADE,
            profiling=1)
        assert ans['output'] == 1
        logger.info("\nFill sell profiling: %s" % ans)

        ans = self.contract.get_trade(49800558551364658298467690253710486242473574128865389798518930174170604985043L)
        assert ans == [0, 0, 0, 0, 0, 0, 0, 0]

        ans = self.contract.get_sub_balance(self.BOB['address'], 1)
        assert ans == [fill_amount, 0]

        ans = self.contract.get_sub_balance(self.ALICE['address'], 1)
        assert ans == [820000000, 130000000]

        if revert:
            self.state.revert(snapshot)
        else:
            return snapshot

    def test_get_trade_ids_after_first_sell(self):
        self.test_add_buy_trades()
        snapshot = self.test_fulfill_first_sell(False)

        ans = self.contract.get_trade_ids(1)
        assert ans == [
            -11872296793322400290999375245896441639313038086627719556596606178564438289113L,
            -34362698062012420373581910342777892308255636544894323695139344222373572831032L,
            38936224262371094519907212029104196662516973526369593745812124922634258039407L,
            -35168633768494065610302920664120686116555617894816459733689825088489895266148L,
            23490291715255176443338864873375620519154876621682055163056454432194948412040L]
        self.state.revert(snapshot)

    def test_etx_issuance_after_first_sell(self):
        self.test_add_buy_trades()
        snapshot = self.test_fulfill_first_sell(False)

        # If issuing 1 ETX per ETH...
        # assert self.etx_contract.balanceOf(self.BOB['address']) == 125 * 10 ** 5
        # assert self.etx_contract.balanceOf(self.ALICE['address']) == 990125 * 10 ** 5

        # 1 ETX
        assert self.etx_contract.balanceOf(self.BOB['address']) == 10 ** 5
        # Initial issuance - 10,000 deposit + 1 ETX
        assert self.etx_contract.balanceOf(self.ALICE['address']) == (990000 * 10 ** 5) + 10 ** 5

        # ETX contract's ETH balance: initial endowment + FEE_PER_TRADE
        assert self.state.block.get_balance(self.etx_contract.address) == 10 ** 21 + FEE_PER_TRADE

        self.state.revert(snapshot)

    def test_fulfill_multiple_trades(self, revert=True):
        self.test_add_buy_trades()
        self.test_add_sell_trades(False)
        self.test_transfer_to_bob_and_deposit()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        balance_from_transfer = 10000 * 10 ** 5
        fill_amount = 1800 * 10 ** 5

        balance = self.state.block.get_balance(self.BOB['address'])
        assert balance == 10 ** 24 - self.deposit_cost

        # Fill first and second trade
        ans = self.contract.trade(
            fill_amount, [
                23490291715255176443338864873375620519154876621682055163056454432194948412040L,
                -35168633768494065610302920664120686116555617894816459733689825088489895266148L,
                38936224262371094519907212029104196662516973526369593745812124922634258039407L],
            sender=self.BOB['key'],
            value=3 * FEE_PER_TRADE,
            profiling=1)
        assert ans['output'] == 1
        logger.info("\nFill multiple profiling: %s" % ans)

        ans = self.contract.get_sub_balance(self.BOB['address'], 1)
        assert ans == [balance_from_transfer - fill_amount, 0]

        ans = self.contract.get_sub_balance(self.ALICE['address'], 1)
        assert ans == [1000000000, 180000000]

        ans = self.state.block.get_balance(self.BOB['address'])
        assert ans > 1000449999999999999000000L
        assert ans < 1000450000000000000000000L

        if revert:
            self.state.revert(snapshot)
        else:
            return snapshot

    def test_get_trade_ids_after_multiple_trades(self):
        snapshot = self.test_fulfill_multiple_trades(False)

        ans = self.contract.get_trade_ids(1)
        assert ans == [
            -11872296793322400290999375245896441639313038086627719556596606178564438289113L,
            -34362698062012420373581910342777892308255636544894323695139344222373572831032L,
            49800558551364658298467690253710486242473574128865389798518930174170604985043L]
        self.state.revert(snapshot)

    def test_etx_issuance_and_total_after_multiple_trades(self):
        snapshot = self.test_fulfill_multiple_trades(False)

        # If issuing 1 ETX per ETH...
        # assert self.etx_contract.balanceOf(self.BOB['address']) == (125 + 150 + 175) * 10 ** 5
        # assert self.etx_contract.balanceOf(self.ALICE['address']) == (980000 + 125 + 150 + 175) * 10 ** 5

        # 3 ETX
        assert self.etx_contract.balanceOf(self.BOB['address']) == 3 * 10 ** 5
        # Initial issuance - 10,000 deposit - 10,000 transfer to BOB + 3 ETX
        assert self.etx_contract.balanceOf(self.ALICE['address']) == (980000 * 10 ** 5) + 3 * 10 ** 5

        # ETX contract's ETH balance: initial endowment + 3 * FEE_PER_TRADE
        assert self.state.block.get_balance(self.etx_contract.address) == 10 ** 21 + 3 * FEE_PER_TRADE

        self.state.revert(snapshot)

    def test_partial_fill_multiple_trades(self, revert=True):
        self.test_add_buy_trades()
        self.test_add_sell_trades(False)
        self.test_transfer_to_bob_and_deposit()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        balance_from_transfer = 10000 * 10 ** 5
        fill_amount = 1400 * 10 ** 5

        # Fill first and part of second trade
        ans = self.contract.trade(
            fill_amount, [
                23490291715255176443338864873375620519154876621682055163056454432194948412040L,
                -35168633768494065610302920664120686116555617894816459733689825088489895266148L,
                38936224262371094519907212029104196662516973526369593745812124922634258039407L],
            sender=self.BOB['key'])
        assert ans == 1

        ans = self.contract.get_sub_balance(self.BOB['address'], 1)
        assert ans == [balance_from_transfer - fill_amount, 0]

        if revert:
            self.state.revert(snapshot)
        else:
            return snapshot

    def test_get_trade_ids_after_partial_fill(self):
        snapshot = self.test_partial_fill_multiple_trades(False)

        ans = self.contract.get_trade_ids(1)
        assert ans == [
            -11872296793322400290999375245896441639313038086627719556596606178564438289113L,
            -34362698062012420373581910342777892308255636544894323695139344222373572831032L,
            49800558551364658298467690253710486242473574128865389798518930174170604985043L,
            38936224262371094519907212029104196662516973526369593745812124922634258039407L]
        self.state.revert(snapshot)
