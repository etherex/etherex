from collections import Counter
import re
import subprocess

from pyethereum import transactions, blocks, processblock, utils

from utils import encode_datalist, decode_datalist

# processblock.debug = 1


def compile_serpent(filename):
    try:
        output = subprocess.check_output(["serpent", "compile", filename], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        raise CompilationException(e.output)

    return output.strip().decode('hex')

def compile_lll(filename):
    try:
        output = subprocess.check_output(["lllc", filename], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        raise CompilationException(e.output)

    return output.strip().decode('hex')

def compile_mutan(filename):
    try:
        output = subprocess.check_output(["mutan", filename], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        raise CompilationException(e.output)

    match = re.search("hex: 0x([0-9a-f]+)", output)
    if not match:
        raise CompilationException(output)

    return match.group(1).decode('hex')


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
        return self.genesis.get_storage(contract).to_dict()
