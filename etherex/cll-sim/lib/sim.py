from collections import defaultdict
import os
import sys
import imp
import inspect
import logging
from operator import itemgetter

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
    self = _infer_self()
    logging.info("Sending tx to %s of %s" % (recipient, amount))
    self.txs.append((recipient, amount, datan, data))

def stop(reason):
    raise Stop(reason)

def array(n):
    return [None] * n

log = logging.info

class Block(object):

    def __init__(self, timestamp=0, difficulty= 2 ** 22, number=1, parenthash="parenthash"):
        self.timestamp = timestamp
        self.difficulty = difficulty
        self.number = number
        self.parenthash = parenthash
        self._storages = defaultdict(Storage)
        self._balances = defaultdict(int)

    def account_balance(self, account):
        if _is_called_by_contract():
            logging.debug("Accessing account_balance '%s'" % account)
        return self._balances[account]

    def set_account_balance(self, account, value):
        self._balances[account] = value

    @property
    def basefee(self):
        return 1

    def contract_storage(self, key):
        if _is_called_by_contract():
            logging.debug("Accessing contract_storage '%s'" % key)
        return self._storages[key]


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
        self.txs = []

        caller_module = _infer_self(offset=1)

        # initializing constants
        for (arg, value) in kwargs.iteritems():
            if not arg.isupper():
                raise KeyError("Constant '%s' should be uppercase" % arg)

            logging.debug("Initializing constant %s = %s" % (arg, value))
            setattr(caller_module, arg, value)
            _modify_frame_global(arg, value)

    def run(self, tx, contract, block):
        raise NotImplementedError("Should have implemented this")

    def load(self, script, tx, contract, block):
        closure = 'from sim import Block, Contract, Simulation, Tx, log, mktx, stop, array\n\
class HLL(Contract):\n\
    def run(self, tx, contract, block):\n'
        with open(script) as fp:
            for i, line in enumerate(fp):
                # Use comments for stop and log messages
                l = line.strip()
                if l.startswith("stop"):
                    # Line number as default stop message
                    s = "line " + str(i)
                    if '//' in line:
                        s = l.split("//")[1].strip()
                    line = line.split("stop")[0] + "stop('%s')\n" % s
                elif "//" in line:
                    s = l.split("//")[1].strip()
                    indent = len(line) - len(line.lstrip())
                    line = line.split("//")[0]
                    line += "\n" + '        ' + " " * indent + "log('%s')\n" % ("@ line " + str(i) + ": " + s)

                # Indent
                closure += '        ' + line

        # Exponents
        closure = closure.replace("^", "**")

        # Comments
        closure = closure.replace("//", "#")

        closure_module = imp.new_module('hll')
        exec(closure, closure_module.__dict__)
        h = closure_module.HLL()
        h.run(tx, contract, block)

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

    def run(self, tx, contract, block=None):
        self.stopped = False
        if block is None:
            block = Block()

        method_name = inspect.stack()[1][3]
        logging.info("RUN %s: %s" % (method_name, tx))

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
        logging.info('-' * 20)


class Storage(object):

    def __init__(self):
        self._storage = defaultdict(int)

    def __getitem__(self, key):
        if _is_called_by_contract():
            logging.debug("Accessing storage '%s'" % key)
        return self._storage[key]

    def __setitem__(self, key, value):
        if _is_called_by_contract():
            logging.debug("Setting storage '%s' to '%s'" % (key, value))
        self._storage[key] = value

    def __repr__(self):
        return "<storage %s>" % repr(self._storage)


class Tx(object):

    def __init__(self, sender=None, value=0, fee=0, data=[]):
        self.sender = sender
        self.value = value
        self.fee = fee
        self.data = data
        self.datan = len(data)

    def __repr__(self):
        return '<tx sender=%s value=%d fee=%d data=%s datan=%d>' % (self.sender, self.value, self.fee, self.data, self.datan)
