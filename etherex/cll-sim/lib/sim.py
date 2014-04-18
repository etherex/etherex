from collections import defaultdict
import os, sys, imp
import inspect
import logging
from operator import itemgetter
MINGASPRICE = 10000000000000

def _modify_frame_global(key, value, stack=None, offset=2):
    if stack is None:
        stack = inspect.stack()
    stack[offset][0].f_globals[key] = value

def _infer_self(stack=None, offset=2):
    if stack is None:
        stack = inspect.stack()
    return stack[offset][0].f_locals['self']

def _is_called_by_contract():
    self = _infer_self(inspect.stack())
    caller_class = self.__class__
    return Contract in caller_class.__bases__

def mktx(recipient, amount, datan, data):
    self = _infer_self(inspect.stack())
    logging.info("Sending tx to %s of %s" % (recipient, amount))
    self.txs.append((recipient, amount, datan, data))

def send(recipient, amount, gas):
    self = _infer_self(inspect.stack())
    logging.info("Sending tx to %s of %s" % (recipient, amount))
    self.txs.append((recipient, amount, datan, data))

def mkmsg(recipient, amount, gas, data, datan):
    self = _infer_self(inspect.stack())
    logging.info("Sending tx to %s of %s with data %s" % (recipient, amount, data))
    self.txs.append((recipient, amount, datan, data))

def stop(reason):
    raise Stop(reason)

def stopret(value, index=None):
    if index:
        raise Stop(value[index])
    else:
        raise Stop(value)

def array(n):
    return [None] * n

def suicide(address):
    self = _infer_self(inspect.stack())
    balance = self.balance[self.address]
    logging.info("Suicide balance of %s from %s to %s" % (balance, self.address, address))
    self.txs.append((address, balance, 0, 0))
    self.balance[self.address] = 0

log = logging.info

class Block(object):

    def __init__(self, timestamp=0, difficulty= 2 ** 22, number=1, parenthash="parenthash"):
        self.timestamp = timestamp
        self.difficulty = difficulty
        self.number = number
        self.parenthash = parenthash
        self._storages = defaultdict(Storage)
        self.gaslimit = 1 * 10 ^ 42

    @property
    def basefee(self):
        return 1

    # def contract_storage(self, key): # :(
    #     if _is_called_by_contract():
    #         logging.debug("Accessing contract_storage '%s'" % key)
    #     return self._storages[key]


class Stop(RuntimeError):
    pass


class Contract(object):

    @property
    def address(self):
        return hex(id(self))

    @property
    def contract(self):
        return self

    def __init__(self, *args, **kwargs):
        self.storage = Storage()
        self.balance = Balance() # balances if balances else defaultdict(int)
        self.txs = []

        caller_module = _infer_self(offset=1)

        # initializing constants
        for (arg, value) in kwargs.iteritems():
            if not arg.isupper():
                raise KeyError("Constant '%s' should be uppercase" % arg)

            logging.debug("Initializing constant %s = %s" % (arg, value))
            setattr(caller_module, arg, value)
            _modify_frame_global(arg, value)

    def run(self, tx, msg, contract, block):
        raise NotImplementedError("Should have implemented this")

    def load(self, script, tx, contract, block):
        if hasattr(self, "closure_module") and inspect.ismodule(self.closure_module):
            closure = self.closure
            closure_module = self.closure_module
        else:
            log("Loading %s" % script)

            closure = """
from sim import Block, Contract, Simulation, Tx, Msg, log, stop, suicide, array, stopret, mkmsg, send
class HLL(Contract):
    def run(self, tx, msg, contract, block):
"""
            baseindent = "        "

            with open(script) as fp:
                for i, line in enumerate(fp):
                    # Use comments for stop and log messages
                    l = line.strip()
                    if l.startswith("stop"):
                        # Line number as default stop message
                        s = "line " + str(i)
                        if '//' in line:
                            s = l.split("//")[1].strip()
                            if not s.startswith('"'):
                                s = '"' + s + '"'
                        line = line.split("stop")[0] + "stop(%s)\n" % s
                    elif "define" in line:
                        sp = l.split("//")
                        s = sp[1].strip()
                        r = s.split("define")[1].strip().split("=")
                        indent = " " * (len(line) - len(line.lstrip()))
                        line = indent
                        if l.split("//")[0].strip().endswith(":"):
                            line += "    "
                        line += "log('@ line %d: %s" % (i, s)
                        r[1] = str(r[1])
                        if isinstance(r[0], str):
                            line += ", %%s as hex: 0x%%s' %% (%s," % r[1]
                            line += "%s.encode('hex')) + " % r[1]
                            line += "', as int: %d' % "
                            line += "int(%s.encode('hex'), 16))\n" % r[1]
                        else:
                            line += "')\n"
                        line += baseindent + indent + sp[0].replace(r[0].strip(), r[1].strip(), 1) + "\n"
                    elif "//" in line:
                        s = l.split("//")[1].strip()
                        if s.startswith('"'):
                            s = "log('@ line %d: ' + %s)\n" % (i, s)
                        else:
                            s = "log('@ line %d: %s')\n" % (i, s)
                        line = line.split("//")[0] + "\n"
                        if l.split("//")[0].strip().endswith(":"):
                            line += "    "
                        indent = " " * (len(line) - len(line.lstrip()))
                        line += baseindent + indent + s

                    # Indent
                    closure += baseindent + line

            # Exponents
            closure = closure.replace("^", "**")

            # Hex
            closure = closure.replace("hex(", "str(")

            # Return
            closure = closure.replace("return(", "stopret(")

            # msg
            closure = closure.replace("msg(", "mkmsg(")

            # Comments
            closure = closure.replace("//", "#")

            # Initialize module
            closure_module = imp.new_module('hll')

            # Pass txs and constants
            for i, c in self.__dict__.items():
                closure_module.__dict__[i] = c

            # Set self.closure_module for reuse and self.closure for export
            self.closure = closure
            self.closure_module = closure_module

            # Execute and run
            exec(closure, closure_module.__dict__)

        h = closure_module.HLL()
        msg = Msg(tx)
        h.run(tx, msg, contract, block)


class Simulation(object):

    def __init__(self):
        self.log = logging.info
        self.warn = logging.warn
        self.error = logging.error

    def run_all(self):
        test_methods = [(name, method, method.im_func.func_code.co_firstlineno) for name, method in inspect.getmembers(self, predicate=inspect.ismethod)
                        if name.startswith('test_')]

        # sort by linenr
        for name, method, linenr in sorted(test_methods, key=itemgetter(2)):
            method()

    def run(self, tx, contract, block=None, method_name=None):
        self.stopped = False
        if block is None:
            block = Block()

        if method_name is None:
            method_name = inspect.stack()[1][3]

        logging.info("RUN %s: %s" % (method_name.replace('_', ' ').capitalize(), tx))

        msg = Msg(tx)
        contract.txs = []

        try:
            contract.run(tx, contract, block)
        except Stop as e:
            if e.message:
                logging.warn("Stopped: %s" % e.message)
                self.stopped = e.message
            else:
                logging.info("Stopped")
                self.stopped = True

        gas = Gas()
        totalgas = gas.calculate_gas(contract)
        logging.debug("Fees: %d" % totalgas['total'])
        endowment = contract.balance[contract.address]
        addendowment = tx.value - totalgas['total']
        if addendowment > 0:
            logging.info("Adding %d to endowment" % addendowment)
            endowment += addendowment
            contract.balance[contract.address] = endowment
            logging.info("New endowment: %d" % endowment)
        else:
            logging.info("Current endowment: %d" % endowment)
        # contract.balance[tx.sender] -= endowment

        logging.info('-' * 20)
        logging.info(contract.storage)
        logging.info('-' * 20)
        logging.info(contract.balance)
        logging.info('=' * 20)


class Storage(object):

    def __init__(self):
        self._storage = defaultdict(int)

    def __getitem__(self, key):
        if isinstance(key,(str,unicode)):
            key = int(key.encode('hex'), 16)
        if _is_called_by_contract():
            logging.debug("Accessing storage '%s'" % key)
        return self._storage[key]

    def __setitem__(self, key, value):
        if isinstance(key,(str,unicode)):
            key = int(key.encode('hex'), 16)
        if _is_called_by_contract():
            logging.debug("Setting storage '%s' to '%s'" % (key, value))
        self._storage[key] = value

    def __repr__(self):
        return "<storage %s>" % repr(self._storage)


class Tx(object):

    def __init__(self, sender=None, value=0, fee=1 * 10 ** 15, gas=0, gasprice=0, data=[]):
        self.sender = sender
        self.value = value
        self.fee = fee
        self.gasprice = gasprice if gasprice else MINGASPRICE
        self.gas = gas if gas else self.fee / self.gasprice
        gasfee = self.gas * self.gasprice
        if gasfee > self.fee:
            self.fee = gasfee
        self.data = data
        self.datan = len(data)

        contract = _is_called_by_contract()
        if contract:
            gas = Gas()
            totalgas = gas.calculate_gas(contract)
            freeload = value + totalgas
            self.contract.balance[self.contract.address] += freeload
            logging.debug("Freeloading %s with %d" % (sender, freeload))

    def __repr__(self):
        return '<tx sender=%s value=%d fee=%d gas=%d gasprice=%d data=%s datan=%d>' % (self.sender, self.value, self.fee, self.gas, self.gasprice, self.data, self.datan)


class Msg(object):

    def __init__(self, tx):
        self.datasize = tx.datan
        self.sender = tx.sender
        self.value = tx.value
        self.data = tx.data

    def __getitem__(self):
        return self


class Balance(object):

    def __init__(self):
        self._balance = defaultdict(int)

    def __getitem__(self, address):
        balance = self._balance[address]
        if _is_called_by_contract():
            logging.debug("Accessing balance '%s' of '%s'" % (balance, address))
        return balance

    def __setitem__(self, address, value):
        # if _is_called_by_contract():
        #     logging.debug("Cannot set balance of '%s' to '%s'" % (address, value))
        # else:
        logging.debug("Setting balance of '%s' to '%s'" % (address, value))
        self._balance[address] = value

    def __repr__(self):
        return "<balance %s>" % repr(self._balance)

class Gas(object):

    def __init__(self):
        self._gas = 0
        self.gas = 100
        self.gasprice = MINGASPRICE
        self.pricestep = 1 # opcode count
        self.pricedata = 20 # storage load access
        self.pricestorage = 100 # storage store access
        self.pricememory = 1 # opcode count
        self.pricetx = 100 # tx fee
        self.pricebasecontract = 100 # new contract feww
        self.pricetxdata = 1 # opcode count

        # tx fee + newcontractfee (opt) + stepfee (count opcode steps) + datafee (storage access) + ...

        # quick ref from c++
        # u256 const eth::c_stepGas = 1;
        # u256 const eth::c_balanceGas = 20;
        # u256 const eth::c_sha3Gas = 20;
        # u256 const eth::c_sloadGas = 20;
        # u256 const eth::c_sstoreGas = 100;
        # u256 const eth::c_createGas = 100;
        # u256 const eth::c_callGas = 20;
        # u256 const eth::c_memoryGas = 1;
        # u256 const eth::c_txDataGas = 5;


    def calculate_gas(self, contract):

        # if 'traceback' in self.results['es']:
        #     return

        gas = { 'tx': self.gasprice * self.pricetx, 'step': 0, 'storage': 0 }

        # step gas
        # comp_steps = [e for e in self.results['es']['code'] if isinstance(e,str)]
        # fees['step'] = len(comp_steps[16:])


        # storage fees
        code_lines = contract.closure.split('\n')
        for i, line in enumerate(code_lines):
            if line.startswith('contract.storage['): # TODO: use regex?
                fees['storage'] += self.pricestorage

        # add up gas for total
        gas['total'] = sum(gas.values())

        return gas
