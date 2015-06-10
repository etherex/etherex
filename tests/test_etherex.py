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
logging.getLogger('eth.pb').setLevel('INFO')
logging.getLogger('eth.pb.msg').setLevel('INFO')
logging.getLogger('eth.pb.msg.state').setLevel('INFO')
logging.getLogger('eth.pb.tx').setLevel('INFO')
logging.getLogger('eth.vm').setLevel('INFO')
logging.getLogger('eth.vm.op').setLevel('INFO')
logging.getLogger('eth.vm.exit').setLevel('INFO')
logging.getLogger('eth.chain.tx').setLevel('INFO')
logging.getLogger('transactions.py').setLevel('INFO')
logging.getLogger('eth.msg').setLevel('INFO')

class TestEtherEx(object):

    ALICE = {'address': tester.a0.encode('hex'), 'key': tester.k0}
    BOB = {'address': tester.a1.encode('hex'), 'key': tester.k1}
    CHARLIE = {'address': tester.a2.encode('hex'), 'key': tester.k2}

    # NameReg
    namereg = 'contracts/namereg.se'

    # EtherEx contracts
    etherex = 'contracts/etherex.se'
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

    def ptr_add(self, ptr, x=1):
        return hex(int(ptr, 16) + x)

    def _storage(self, contract, idx):
        return self.state.block.account_to_dict(contract.address)['storage'].get(idx)

    # Setup
    def setup_class(self):
        self.state = tester.state()

        self.namereg = self.state.abi_contract(self.namereg)

        self.contract = self.state.abi_contract(self.etherex, gas=2500000)

        self.etx_contract = self.state.abi_contract(self.etx)
        self.bob_contract = self.state.abi_contract(self.bob)

        self.snapshot = self.state.snapshot()

    def setup_method(self, method):
        self.state.revert(self.snapshot)
        tester.seed = 3 ** 160  # use fixed testing seed

    # Tests
    def test_creation(self):
        assert self._storage(self.contract, "0x") is None  # "0x88554646aa"
        assert self._storage(self.contract, "0x01") == "0x" + self.ALICE['address']

        assert self.etx_contract.balance(self.ALICE['address']) == 1000000 * 10 ** 5
        assert self.bob_contract.balance(self.ALICE['address']) == 1000000 * 10 ** 5

    def test_initialize(self, block=None):
        # NameReg Alice
        ans = self.namereg.register(self.ALICE['address'], "Alice")
        assert ans == 1
        assert self._storage(self.namereg, "0x" + self.ALICE['address']) == "0x" + "Alice".encode('hex')
        assert self.namereg.getname(self.ALICE['address']) == utils.big_endian_to_int("Alice")

        # NameReg EtherEx
        ans = self.namereg.register(self.contract.address, "EtherEx")
        assert ans == 1
        assert self._storage(self.namereg, "0x" + self.contract.address.encode('hex')) == "0x" + "EtherEx".encode('hex')

        # NameReg ETX
        ans = self.namereg.register(self.etx_contract.address, "ETX")
        assert ans == 1
        assert self._storage(self.namereg, "0x" + self.etx_contract.address.encode('hex')) == "0x" + "ETX".encode('hex')

        # Register ETX
        ans = self.contract.add_market(
            "ETX", self.etx_contract.address, 5, 10 ** 8, 10 ** 18, 1,
            sender=self.ALICE['key'])
        assert ans == 1

        # Set exchange address in ETX contract
        ans = self.etx_contract.set_exchange(
            self.contract.address, 1,
            sender=self.ALICE['key'])
        assert ans == 1
        assert self._storage(self.etx_contract, self.xhex(1)) == "0x" + self.contract.address.encode('hex')

        # Get markets pointer...
        self.ptr = self._storage(self.contract, "0x06")
        logger.info("Markets start at %s, then %s ..." % (self.ptr, self.ptr_add(self.ptr, 1)))
        logger.info(self.state.block.account_to_dict(self.contract.address.encode('hex'))['storage'])
        logger.info("===")

        assert self._storage(self.contract, self.ptr_add(self.ptr, 0)) == self.xhex(1)  # Market ID
        assert self._storage(self.contract, self.ptr_add(self.ptr, 1)) == "0x" + "ETX".encode('hex')  # Name
        assert self._storage(self.contract, self.ptr_add(self.ptr, 2)) == "0x" + self.etx_contract.address.encode('hex')  # Contract address
        assert self._storage(self.contract, self.ptr_add(self.ptr, 3)) == self.xhex(5)  # Decimal precision
        assert self._storage(self.contract, self.ptr_add(self.ptr, 4)) == self.xhex(10 ** 8)  # Price precision
        assert self._storage(self.contract, self.ptr_add(self.ptr, 5)) == self.xhex(10 ** 18)  # Minimum amount
        assert self._storage(self.contract, self.ptr_add(self.ptr, 6)) == self.xhex(1)  # Category
        assert self._storage(self.contract, self.ptr_add(self.ptr, 7)) == self.xhex(1)  # Last price
        assert self._storage(self.contract, self.ptr_add(self.ptr, 8)) == "0x" + self.ALICE['address']  # Owner
        assert self._storage(self.contract, self.ptr_add(self.ptr, 9)) == block  # Block

    def test_change_creator(self):
        self.test_initialize()

        new_creator = "f9e57456f18d90886263fedd9cc30b27cd959137"

        ans = self.contract.change_creator(new_creator)
        assert ans == 1
        assert self._storage(self.contract, "0x01") == "0x" + new_creator

    def test_get_last_market_id(self):
        self.test_initialize()

        ans = self.contract.get_last_market_id()
        assert ans == 1

    def test_get_market(self):
        self.test_initialize()

        ans = self.contract.get_market(1)

        assert ans == [
            1,
            4543576,
            584202455294917676171628316407181071088652546483L,
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
        assert ans == 1

        # Alice has 1000 less
        ans = self.etx_contract.balance(self.ALICE['address'])
        assert ans == 1000000 * 10 ** 5 - 1000 * 10 ** 5

        # Bob has 1000
        ans = self.etx_contract.balance(self.BOB['address'])
        assert ans == 1000 * 10 ** 5

        # assert self._storage(self.etx_contract, int(self.ALICE['address'], 16)) == self.xhex(1000000 - 1000)
        # assert self._storage(self.etx_contract, int(self.BOB['address'], 16)) == self.xhex(1000)

    def test_bob_to_charlie_fail(self):
        self.test_initialize()

        ans = self.etx_contract.transfer(self.CHARLIE['address'], 1000 * 10 ** 5, sender=self.BOB['key'])
        assert ans == 0

    def test_alice_to_bob_to_charlie(self):
        self.test_initialize()

        # Send 1000 to Bob
        ans = self.etx_contract.transfer(self.BOB['address'], 1000 * 10 ** 5)
        assert ans == 1

        # Bob sends 250 to Charlie
        ans = self.etx_contract.transfer(self.CHARLIE['address'], 250 * 10 ** 5, sender=self.BOB['key'])
        assert ans == 1

        # Charlie now has 250
        ans = self.etx_contract.balance(self.CHARLIE['address'])
        assert ans == 250 * 10 ** 5

    #
    # Balances
    #
    def test_sub_balance(self):
        self.test_initialize()

        ans = self.etx_contract.balance(self.ALICE['address'])
        assert ans == 1000000 * 10 ** 5

    def test_deposit_to_exchange(self, init=True):
        if init:
            self.test_initialize()

        # Deposit 10000 into exchange
        ans = self.etx_contract.transfer(self.contract.address, 10000 * 10 ** 5)
        assert ans == 1

        # Alice has 10000 less
        ans = self.etx_contract.balance(self.ALICE['address'])
        assert ans == 1000000 * 10 ** 5 - 10000 * 10 ** 5

        # Exchange has 10000
        ans = self.etx_contract.balance(self.contract.address)
        assert ans == 10000 * 10 ** 5

        # Alice has 10000 in the exchange
        ans = self.contract.get_sub_balance(self.ALICE['address'], 1)
        assert ans == [10000 * 10 ** 5, 0]

    def test_log_deposit(self):
        snapshot = self.state.snapshot()
        o = []
        self.state.block.log_listeners.append(lambda x: o.append(self.contract._translator.listen(x)))

        self.test_deposit_to_exchange()

        assert o == [{
            "_event_type": "log_deposit",
            "sender": int("0x" + self.ALICE['address'], 16),
            "market": 1,
            "amount": 10000 * 10 ** 5
        }]
        self.state.revert(snapshot)

    def test_withdraw_sub_fail(self):
        self.test_initialize()

        ans = self.contract.withdraw(1000 * 10 ** 5, 1)
        assert ans == 0

    def test_withdraw_sub(self):
        self.test_deposit_to_exchange()

        ans = self.contract.withdraw(1000 * 10 ** 5, 1)
        assert ans == 1

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
        ans = self.contract.add_market("BOB", self.bob_contract.address, 4, 10 ** 8, 10 ** 18, sender=self.BOB['key'])
        assert ans == 1

        # Set exchange address in BOB contract
        ans = self.bob_contract.set_exchange(self.contract.address, 2)
        assert ans == 1
        assert self._storage(self.bob_contract, self.xhex(1)) == "0x" + self.contract.address.encode('hex')

    def test_get_new_last_market_id(self):
        self.test_add_bob_coin()

        ans = self.contract.get_last_market_id()
        assert ans == 2

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
        assert ans == 13

    #
    # Trades
    #

    def test_add_buy_trades(self):
        self.test_initialize()

        self.initial_balance = self.state.block.get_balance(self.ALICE['address'])

        # Add buy trade
        ans = self.contract.buy(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=125 * 10 ** 18)
        assert ans == 23490291715255176443338864873375620519154876621682055163056454432194948412040L

        # Another buy trade
        ans = self.contract.buy(600 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=150 * 10 ** 18)
        assert ans == -35168633768494065610302920664120686116555617894816459733689825088489895266148L

        # And another
        ans = self.contract.buy(700 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=175 * 10 ** 18)
        assert ans == 38936224262371094519907212029104196662516973526369593745812124922634258039407L

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
            -43661844752590979300431051014294333542661024257584153614584419342051414010805L]

    def test_trade_already_exists(self):
        self.test_add_buy_trades()

        ans = self.contract.buy(500 * 10 ** 5, int(0.25 * 10 ** 8), 1, value=125 * 10 ** 18)
        assert ans == 15

    def test_add_sell_trades(self, init=True):
        self.test_deposit_to_exchange(init)

        # Add sell trade
        ans = self.contract.sell(500 * 10 ** 5, int(0.25 * 10 ** 8), 1)
        assert ans == 49800558551364658298467690253710486242473574128865389798518930174170604985043L

        ans = self.contract.sell(600 * 10 ** 5, int(0.25 * 10 ** 8), 1)
        assert ans == -34362698062012420373581910342777892308255636544894323695139344222373572831032L

        ans = self.contract.sell(700 * 10 ** 5, int(0.25 * 10 ** 8), 1)
        assert ans == -11872296793322400290999375245896441639313038086627719556596606178564438289113L

        logger.info("Storage after adding trades:")
        logger.info(self.state.block.account_to_dict(self.contract.address)['storage'])
        logger.info("===")

    def test_get_trade_ids(self):
        self.test_add_buy_trades()
        self.test_add_sell_trades(False)

        ans = self.contract.get_trade_ids(1)
        assert ans == [
            23490291715255176443338864873375620519154876621682055163056454432194948412040L,
            -35168633768494065610302920664120686116555617894816459733689825088489895266148L,
            38936224262371094519907212029104196662516973526369593745812124922634258039407L,
            49800558551364658298467690253710486242473574128865389798518930174170604985043L,
            -34362698062012420373581910342777892308255636544894323695139344222373572831032L,
            -11872296793322400290999375245896441639313038086627719556596606178564438289113L]

    def test_cancel_trade_fail(self):
        self.test_add_buy_trades()

        ans = self.contract.cancel(
            23490291715255176443338864873375620519154876621682055163056454432194948412040L,
            sender=self.BOB['key'])
        assert ans == 0

    def test_cancel_trade(self):
        self.test_add_buy_trades()

        ans = self.contract.cancel(23490291715255176443338864873375620519154876621682055163056454432194948412040L)
        assert ans == 1
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
        assert ans == 14

    def test_fulfill_first_buy_fail(self):
        self.test_add_buy_trades()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        ans = self.contract.trade(
            500 * 10 ** 5,
            [23490291715255176443338864873375620519154876621682055163056454432194948412040L],
            sender=self.BOB['key'])
        assert ans == 12
        self.state.revert(snapshot)

    def test_fulfill_first_sell_fail(self):
        self.test_add_sell_trades()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        ans = self.contract.trade(
            500 * 10 ** 5,
            [49800558551364658298467690253710486242473574128865389798518930174170604985043L])
        assert ans == 12
        self.state.revert(snapshot)

    def test_transfer_to_bob_and_deposit(self):
        # Load BOB with ETX from ALICE
        ans = self.etx_contract.transfer(self.BOB['address'], 10000 * 10 ** 5)
        assert ans == 1

        # Get BOB's balance
        balance = self.state.block.get_balance(self.BOB['address'])
        assert balance == 10 ** 24

        # Deposit 1000 into exchange
        ans = self.etx_contract.transfer(
            self.contract.address,
            10000 * 10 ** 5,
            sender=self.BOB['key'])
        assert ans == 1

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
            sender=self.BOB['key'])
        assert ans == 1

        ans = self.contract.get_trade(23490291715255176443338864873375620519154876621682055163056454432194948412040L)
        assert ans == [0, 0, 0, 0, 0, 0, 0, 0]

        if revert:
            self.state.revert(snapshot)
        else:
            return snapshot
        # TODO - proper balance assertions

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

        assert o == [{
            '_event_type': 'log_add_tx',
            'sender': 745948140856946866108753121277737810491401257713L,
            'amount': 50000000,
            'market': 1,
            'price': 25000000,
            'type': 1
        }, {
            '_event_type': 'log_add_tx',
            'amount': 60000000,
            'market': 1,
            'price': 25000000,
            'sender': 745948140856946866108753121277737810491401257713L,
            'type': 1
        }, {
            '_event_type': 'log_add_tx',
            'amount': 70000000,
            'market': 1,
            'price': 25000000,
            'sender': 745948140856946866108753121277737810491401257713L,
            'type': 1
        }, {
            '_event_type': 'log_deposit',
            'amount': 1000000000,
            'market': 1,
            'sender': 715574669332965331462488905126228088406116900462L
        }, {
            '_event_type': 'log_fill_tx',
            'amount': 50000000,
            'market': 1,
            'owner': 745948140856946866108753121277737810491401257713L,
            'price': 25000000,
            'sender': 715574669332965331462488905126228088406116900462L,
            'tradeid': 23490291715255176443338864873375620519154876621682055163056454432194948412040L,
            'type': 2
        }, {
            '_event_type': 'log_price',
            'amount': 50000000,
            'market': 1,
            'price': 25000000,
            'timestamp': long(last_timestamp),
            'type': 1
        }]
        self.state.revert(snapshot)

    def test_fulfill_first_sell(self):
        self.test_add_sell_trades()
        snapshot = self.state.snapshot()
        self.state.mine(1)

        ans = self.contract.trade(
            500 * 10 ** 5,
            [49800558551364658298467690253710486242473574128865389798518930174170604985043L],
            sender=self.BOB['key'],
            value=125 * 10 ** 18)
        assert ans == 1

        ans = self.contract.get_trade(49800558551364658298467690253710486242473574128865389798518930174170604985043L)
        assert ans == [0, 0, 0, 0, 0, 0, 0, 0]

        self.state.revert(snapshot)

    def test_fulfill_multiple_trades(self):
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
            sender=self.BOB['key'])
        assert ans == 1

        ans = self.contract.get_sub_balance(self.BOB['address'], 1)
        assert ans == [balance_from_transfer - fill_amount, 0]

        ans = self.state.block.get_balance(self.BOB['address'])
        assert ans > 1000449999999999999000000L
        assert ans < 1000450000000000000000000L

        self.state.revert(snapshot)

    def test_partial_fill_multiple_trades(self):
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

        self.state.revert(snapshot)
