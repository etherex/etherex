from collections import Counter
import subprocess

from pyethereum import transactions, blocks, processblock, utils
from serpent import encode_datalist, decode_datalist

# processblock.debug = 1


def compile_cli(cmd, args, filename):
    try:
        output = subprocess.check_output([cmd] + args + [filename], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        raise CompilationException(e.output)

    return output.strip().decode('hex')


def compile_serpent(filename):
    # with open(filename) as f:
    #     return compile(f.read())
    return compile_cli("serpent", ["compile"], filename)


def compile_lll(filename):
    return compile_cli("lllc", [], filename)


def compile_mutan(filename):
    return compile_cli("mutan", [], filename)


class CompilationException(Exception):
    pass


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
        self.genesis.timestamp = 1388534400  # 2014-01-01
        self.nonce = Counter()

    def load_contract(self, frm, code, endowment=0, gas=STARTGAS):
        _tx = transactions.contract(nonce=self.nonce[frm], gasprice=self.GASPRICE, startgas=gas,
                                    endowment=endowment, code=code).sign(frm.key)
        result, contract = processblock.apply_transaction(self.genesis, _tx)
        assert result

        self.nonce[frm] += 1
        return contract

    def tx(self, frm, to, value, data, gas=STARTGAS):
        _tx = transactions.Transaction(nonce=self.nonce[frm], gasprice=self.GASPRICE, startgas=gas,
                                       to=to, value=value, data=encode_datalist(data)).sign(frm.key)
        result, ans = processblock.apply_transaction(self.genesis, _tx)
        assert result

        self.nonce[frm] += 1
        return decode_datalist(ans)

    def get_storage_data(self, contract, index):
        return self.genesis.get_storage_data(contract, index)

    def get_storage_dict(self, contract):
        return {k[2:].decode('hex'): v[2:].decode('hex')
                for (k, v) in self.genesis.account_to_dict(contract).get('storage').iteritems()}
