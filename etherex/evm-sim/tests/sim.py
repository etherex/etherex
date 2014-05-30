from collections import Counter

from pyethereum import transactions, blocks, processblock, utils
import serpent

# processblock.debug = 1


def load_serpent(filename):
    return serpent.compile(open(filename).read())


class Key(object):

    def __init__(self, secret):
        self.key = utils.sha3(secret)
        self.address = utils.privtoaddr(self.key)


class Simulator(object):

    GASPRICE = 10**12
    STARTGAS = 10000

    def __init__(self, founders):
        self.founders = founders
        self.reset()

    def reset(self):
        self.genesis = blocks.genesis(self.founders)
        self.nonce = Counter()

    def load_contract(self, frm, code, endowment=0, gas=STARTGAS):
        _tx = transactions.contract(nonce=self.nonce[frm], gasprice=self.GASPRICE, startgas=gas,
                                    endowment=endowment, code=code).sign(frm.key)
        result, contract = processblock.apply_transaction(self.genesis, _tx)
        assert result

        self.nonce[frm] += 1
        return contract

    def tx(self, frm, to, value, data):
        _tx = transactions.Transaction(nonce=self.nonce[frm], gasprice=self.GASPRICE, startgas=self.STARTGAS,
                                       to=to, value=value, data=serpent.encode_datalist(data)).sign(frm.key)
        result, ans = processblock.apply_transaction(self.genesis, _tx)
        assert result

        self.nonce[frm] += 1
        return serpent.decode_datalist(ans)

    def get_storage_data(self, contract, index):
        return self.genesis.get_storage_data(contract, index)

    def get_storage_dict(self, contract):
        return self.genesis.get_storage(contract).to_dict()
