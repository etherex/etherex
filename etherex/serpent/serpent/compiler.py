#!/usr/bin/python
import re
from parser import parse
from opcodes import opcodes, reverse_opcodes

label_counter = [0]


def mksymbol():
    label_counter[0] += 1
    return '_' + str(label_counter[0] - 1)

is_numeric = lambda x: isinstance(x, (int, long))
is_string = lambda x: isinstance(x, (str, unicode))

# All functions go here
#
# Format specification (hey guys, I herd you like DSLs so I made a DSL
# to help you write a compiler for your DSL into your other DSL so you
# can debug your code while you debug your code...)
#
# [ val, inputspec, outputcount, code ]
#
# inputspec = either number of arity-1 args or [ a1, a2 ... an ] where
# ak is the arity of arg k
#
# outputspec = arity of output
#
# code = [ arg1, arg2 ... argn ] where each arg is either an op, or
# <k> to input the compilation of arg k, or <Ck> to input the compilation
# of arg k as code in a new context, or ~blah for a label with name blah
# or $blah for the reference to ~blah or $foo.bar for the distance
# between ~foo and ~bar
#
# Example:
#
# ['if', [1, 0], 0, ['<0>', 'NOT', '$endif', 'JUMPI', '<1>', '~endif']],
#
# Takes argument of arity 1 (the condition) and of arity 0 (the stmt),
# returns arity 0, works by jumping over <1> only if the result of <0>
# passed through a NOT is true (ie. if <0> is false it does not do <1>,
# so it does <1> only if <0> is true (yay triple negative))

funtable = [
    ['+', 2, 1, ['<1>', '<0>', 'ADD']],
    ['-', 2, 1, ['<1>', '<0>', 'SUB']],
    ['*', 2, 1, ['<1>', '<0>', 'MUL']],
    ['/', 2, 1, ['<1>', '<0>', 'DIV']],
    ['^', 2, 1, ['<1>', '<0>', 'EXP']],
    ['%', 2, 1, ['<1>', '<0>', 'MOD']],
    ['#/', 2, 1, ['<1>', '<0>', 'SDIV']],
    ['#%', 2, 1, ['<1>', '<0>', 'SMOD']],
    ['==', 2, 1, ['<1>', '<0>', 'EQ']],
    ['<', 2, 1, ['<1>', '<0>', 'LT']],
    ['<=', 2, 1, ['<1>', '<0>', 'GT', 'NOT']],
    ['>', 2, 1, ['<1>', '<0>', 'GT']],
    ['>=', 2, 1, ['<1>', '<0>', 'LT', 'NOT']],
    ['!', 1, 1, ['<0>', 'NOT']],
    ['or', 2, 1, ['<1>', '<0>', 'DUP', 4, 'PC',
                  'ADD', 'JUMPI', 'POP', 'SWAP', 'POP']],
    ['||', 2, 1, ['<1>', '<0>', 'DUP', 4, 'PC',
                  'ADD', 'JUMPI', 'POP', 'SWAP', 'POP']],
    ['and', 2, 1, ['<1>', '<0>', 'NOT', 'NOT', 'MUL']],
    ['&&', 2, 1, ['<1>', '<0>', 'NOT', 'NOT', 'MUL']],
    ['xor', 2, 1, ['<1>', '<0>', 'XOR']],
    ['&', 2, 1, ['<1>', '<0>', 'AND']],
    ['|', 2, 1, ['<1>', '<0>', 'OR']],
    ['byte', 2, 1, ['<0>', '<1>', 'BYTE']],
    ['pop', 1, 0, ['<0>', 'POP']],
    # Word array methods
    # arr, ind -> val
    ['access', 2, 1,
        ['<0>', '<1>', 32, 'MUL', 'ADD', 'MLOAD']],
    # arr, ind, val
    ['arrset', 3, 0,
        ['<2>', '<0>', '<1>', 32, 'MUL', 'ADD', 'MSTORE']],
    # val, pointer -> pointer+32
    ['set_and_inc', 2, 1,
        ['<1>', 'DUP', '<0>', 'SWAP', 'MSTORE', 32, 'ADD']],
    # len -> array
    ['array', 1, 1,
        ['<0>', 32, 'MUL', 'MSIZE', 'SWAP', 'MSIZE',  # msize len*32 msize
         'ADD', 1, 'SWAP', 'SUB', 0, 'SWAP', 'MSTORE8']],  # -> oldmemsize
    # String array methods
    # arr, ind -> val
    ['getch', 2, 1,
        ['<1>', '<0>', 'ADD', 'MLOAD', 255, 'AND']],
    ['setch', 3, 0,
        ['<2>', '<1>', '<0>', 'ADD', 'MSTORE']],  # arr, ind, val
    # len MSIZE (SWAP) MSIZE len (MSIZE ADD) MSIZE MSIZE+len (1) MSIZE
    # MSIZE+len 1 (SWAP SUB) MSIZE MSIZE+len-1 (0 SWAP MSTORE8) MSIZE
    ['string', 1, 1,
        ['<0>', 'MSIZE', 'SWAP', 'MSIZE',  # msize len msize
         'ADD', 1, 'SWAP', 'SUB', 0, 'SWAP', 'MSTORE8']],  # -> oldmemsize
    # to, value, 0, [] -> /dev/null
    ['send', 2, 1,
        [0, 0, 0, 0, '<1>', '<0>', 25, 'GAS', 'SUB', 'CALL']],
    # to, value, gas, [] -> /dev/null
    ['send', 3, 1,
        [0, 0, 0, 0, '<1>', '<0>', '<2>', 'CALL']],
    # to, value, gas, data, datasize -> out32
    ['msg', 5, 1,
        ['MSIZE', 0, 'MSIZE', 'MSTORE', 'DUP', 32, 'SWAP',  # oldmsz 32 oldmsz
         '<4>', 32, 'MUL', '<3>', '<1>', '<0>', '<2>',  # oldmsz <call args>
         'CALL', 'POP', 'MLOAD']],  # -> oldmsz
    # to, value, gas, data, datasize, outsize -> out
    ['msg', 6, 1,
        ['<5>', 32, 'MUL', 'MSIZE', 'SWAP', 'MSIZE',  # msize len*32 msize
         'SWAP', 'DUP', 'MSIZE',  # msize msize len*32 len*32 msize
         'ADD', 1, 'SWAP', 'SUB', 0, 'SWAP', 'MSTORE8',  # msize msize len*32
         'SWAP',  # msize len*32 msize
         '<4>', 32, 'MUL', '<3>', '<1>', '<0>', '<2>',  # oldmsz <call args>
         'CALL', 'POP']],
    # value, gas, data, datasize
    ['create', 4, 1, ['<3>', '<2>', '<1>', '<0>', 'CREATE']],
    # value, gas, dataobject
    ['create', [1, 1, 2], 1, ['<2>', '<1>', '<0>', 'CREATE']],
    ['sha3', 1, 1, [32, 'MSIZE', '<0>', 'MSIZE', 'MSTORE', 'SHA3']],
    ['sha3bytes', 1, 1, ['SHA3']],
    ['sload', 1, 1, ['<0>', 'SLOAD']],
    ['sstore', 2, 0, ['<1>', '<0>', 'SSTORE']],
    ['calldataload', 1, 1, ['<0>', 32, 'MUL', 'CALLDATALOAD']],
    ['id', 1, 1, ['<0>']],
    # returns single val32
    ['return', 1, 0, [
        '<0>', 'MSIZE', 'SWAP', 'MSIZE', 'MSTORE', 32, 'SWAP', 'RETURN']],
    # returns array
    ['return', 2, 0, ['<1>', 32, 'MUL', '<0>', 'RETURN']],
    ['suicide', 1, 0, ['<0>', 'SUICIDE']],
    # if cond then
    ['if', [1, 0], 0, ['<0>', 'NOT', '$endif', 'JUMPI', '<1>', '~endif']],
    # if cond then else
    ['ifelse', [1, 0, 0], 0,
        ['<0>', 'NOT', '$else', 'JUMPI', '<1>',
         '$endif', 'JUMP', '~else', '<2>', '~endif']],
    # while cond code
    ['while', [1, 0], 0,
        ['~beginwhile', '<0>', 'NOT', '$endwhile', 'JUMPI',
         '<1>', '$beginwhile', 'JUMP', '~endwhile']],
    # Inits with code <0> and returns code <1>
    ['init', [0, 0], 0,
        ['<0>', '$begincode.endcode', 'DUP', 'MSIZE', 'SWAP',  # len memsz len
         'MSIZE', '$begincode', 'CALLDATACOPY', 'RETURN',  # cdc and return
         '~begincode', '<C1>', '~endcode']],
    # Returns len, pointer double representing code string
    ['code', [0], 2,
        ['$begincode.endcode', 'DUP', 'MSIZE', 'SWAP',  # len memsize len
         'MSIZE', '$begincode', 'CODECOPY', '$endcode', 'JUMP',  # len memsize
         '~begincode', '<C0>', '~endcode']],
]

# Pseudo-variables representing opcodes
pseudovars = {
    'msg.datasize': [32, 'CALLDATASIZE', 'DIV'],
    'msg.sender': ['CALLER'],
    'msg.value': ['CALLVALUE'],
    'tx.gasprice': ['GASPRICE'],
    'tx.origin': ['ORIGIN'],
    'tx.gas': ['GAS'],
    'contract.balance': ['BALANCE'],
    'contract.address': ['ADDRESS'],
    'block.prevhash': ['PREVHASH'],
    'block.coinbase': ['COINBASE'],
    'block.timestamp': ['TIMESTAMP'],
    'block.number': ['NUMBER'],
    'block.difficulty': ['DIFFICULTY'],
    'block.gaslimit': ['GASLIMIT'],
}


# A set of methods for detecting raw values (numbers and strings) and
# converting them to integers
def frombytes(b):
    return 0 if len(b) == 0 else ord(b[-1]) + 256 * frombytes(b[:-1])


def fromhex(b):
    hexord = lambda x: '0123456789abcdef'.find(x)
    return 0 if len(b) == 0 else hexord(b[-1]) + 16 * fromhex(b[:-1])


def is_numberlike(b):
    if isinstance(b, (str, unicode)):
        if re.match('^[0-9\-]*$', b):
            return True
        if b[0] in ["'", '"'] and b[-1] in ["'", '"'] and b[0] == b[-1]:
            return True
        if b[:2] == '0x':
            return True
    return False


def numberize(b):
    if b[0] in ["'", '"']:
        return frombytes(b[1:-1])
    elif b[:2] == '0x':
        return fromhex(b[2:])
    else:
        return int(b)


# Apply rewrite rules
def _rewrite(ast):
    if isinstance(ast, (str, unicode)):
        return ast
    elif ast[0] == 'set':
        if ast[1][0] == 'access':
            if ast[1][1] == 'contract.storage':
                return ['sstore', _rewrite(ast[1][2]), _rewrite(ast[2])]
            else:
                return ['arrset', _rewrite(ast[1][1]),
                        _rewrite(ast[1][2]), _rewrite(ast[2])]
    elif ast[0] == 'if':
        return ['ifelse' if len(ast) == 4 else 'if'] + map(_rewrite, ast[1:])
    elif ast[0] == 'access':
        if ast[1] == 'msg.data':
            return ['calldataload', _rewrite(ast[2])]
        elif ast[1] == 'contract.storage':
            return ['sload', _rewrite(ast[2])]
    elif ast[0] == 'array_lit':
        o = ['array', str(len(ast[1:]))]
        for a in ast[1:]:
            o = ['set_and_inc', _rewrite(a), o]
        return ['-', o, str(len(ast[1:])*32)]
    elif ast[0] == 'code':
        return ['code', rewrite(ast[1])]
    elif ast[0] == 'return':
        if len(ast) == 2 and ast[1][0] == 'array_lit':
            return ['return', _rewrite(ast[1]), str(len(ast[1][1:]))]
    # Import is to be used specifically for creates
    elif ast[0] == 'import':
        return ['code', rewrite(parse(open(ast[1]).read()))]
    # Inset is to be used like a macro in C++
    elif ast[0] == 'inset':
        return _rewrite(parse(open(ast[1]).read()))
    return map(_rewrite, ast)


def rewrite(ast):
    if ast[0] != 'init':
        return _rewrite(['init', ['seq'], ast])
    else:
        return _rewrite(ast)


# Determine arity of every argument, do AST checking
class decorate():
    def __init__(self, ast):
        if isinstance(ast, (str, unicode)):
            self.value, self.fun = ast, None
            self.arity = 1
        elif ast[0] == 'set':
            self.value, self.fun = None, 'set'
            self.args = map(decorate, ast[1:])
            assert self.args[0].arity == 1
            assert self.args[1].arity == 1
            self.arity = 0
        elif ast[0] == 'seq':
            self.value, self.fun = None, 'seq'
            self.args = map(decorate, ast[1:])
            self.arity = self.args[-1].arity if len(self.args) else 0
        elif is_numeric(ast[0]):
            f = funtable[ast[0]]
            self.value, self.fun = None, f[0]
            self.args = map(decorate, ast[1:])
            self.arity, self.code = f[2], f[3]
        else:
            d = map(decorate, ast[1:])
            for f in funtable:
                if ast[0] == f[0]:
                    f[1] = ([1] * f[1]) if is_numeric(f[1]) else f[1]
                    works = False
                    if len(d) == len(f[1]):
                        works = True
                        for i in range(len(f[1])):
                            if d[i].arity != f[1][i]:
                                works = False
                    if works:
                        self.value, self.fun = None, f[0]
                        self.args = d
                        self.arity = f[2]
                        self.code = f[3]
                        return
            raise Exception("no matching function found", ast)

    def __str__(self):
        if self.value is not None:
            return str(self.value)
        else:
            return str([self.fun] + map(str, self.args))

# Main compiler code


# Debugging
def print_wrapper(f):
    def wrapper(*args, **kwargs):
        print args[0]
        u = f(*args, **kwargs)
        print u
        return u
    return wrapper


# Right-hand-side expressions (ie. the normal kind)
# @print_wrapper
def compile_expr(ast, varhash):
    # Literals
    if ast.value is not None:
        if ast.value == 'stop':
            return ['STOP']
        if is_numberlike(ast.value):
            return [numberize(ast.value)]
        elif ast.value in pseudovars:
            return pseudovars[ast.value]
        else:
            if ast.value not in varhash:
                varhash[ast.value] = len(varhash) * 32
            return [varhash[ast.value], 'MLOAD']
    # Set (specifically, variables)
    elif ast.fun == 'set':
        if ast.args[0].value is None:
            raise Exception("Cannot set value of " + str(ast.args[0].value))
        elif ast.args[0].value in pseudovars:
            raise Exception("Cannot set a pseudovariable!")
        else:
            if ast.args[0].value not in varhash:
                varhash[ast.args[0].value] = len(varhash) * 32
            return (compile_expr(ast.args[1], varhash) +
                    [varhash[ast.args[0].value], 'MSTORE'])
    # Seq
    elif ast.fun == 'seq':
        o = []
        for arg in ast.args:
            o.extend(compile_expr(arg, varhash))
            for i in range(arg.arity):
                o.append('POP')
        return o
    # Functions and operations
    else:
        symb = mksymbol()
        iq = ast.code[:]
        oq = []
        while len(iq):
            tok = iq.pop(0)
            if not is_string(tok):
                oq.append(tok)
            elif tok[0] == '<' and tok[-1] == '>':
                # <C3> = fragment 3, compiled as independent code
                if tok[1] == 'C':
                    sub_vh = {}
                    subcode = compile_expr(ast.args[int(tok[2:-1])], sub_vh)
                    inner = add_wrappers(subcode, sub_vh)
                    oq.extend(['#CODE_BEGIN'] + inner + ['#CODE_END'])
                # <3> = fragment 3
                else:
                    inner = compile_expr(ast.args[int(tok[1:-1])],
                                         varhash)
                    oq.extend(inner)
            elif tok[0] == '~':
                oq.append(tok+symb)
            elif tok[0] == '$':
                vals = tok[1:].split('.')
                if len(vals) == 1:
                    oq.append(tok+symb)
                else:
                    oq.append('$' + vals[0] + symb + '.' + vals[1] + symb)
            else:
                oq.append(tok)
        return oq


# Stuff to add once to each program
def add_wrappers(c, varhash):
    if len(varhash) and 'MSIZE' in c:
        return [0, len(varhash) * 32 - 1, 'MSTORE8'] + c
    else:
        return c


# Optimizations
ops = {
    'ADD': lambda x, y: (x + y) % 2 ** 256,
    'MUL': lambda x, y: (x * y) % 2 ** 256,
    'SUB': lambda x, y: (x - y) % 2 ** 256,
    'DIV': lambda x, y: x / y,
    'EXP': lambda x, y: pow(x, y, 2 ** 256),
    'AND': lambda x, y: x & y,
    'OR': lambda x, y: x | y,
    'XOR': lambda x, y: x ^ y
}


def multipop(li, n):
    if n > 0:
        li.pop()
        multipop(li, n - 1)
    return li


def optimize(c):
    iq = c[:]
    oq = []
    while len(iq):
        oq.append(iq.pop(0))
        if oq[-1] in ops and len(oq) >= 3:
            if is_numeric(oq[-2]) and is_numeric(oq[-3]):
                ntok = ops[oq[-1]](oq[-2], oq[-3])
                multipop(oq, 3).append(ntok)
        if oq[-1] == 'NOT' and len(oq) >= 2 and oq[-2] == 'NOT':
            multipop(oq, 2)
        if oq[-1] == 'ADD' and len(oq) >= 3 and oq[-2] == 0 \
                and is_numberlike(oq[-3]):
            multipop(oq, 2)
        if oq[-1] in ['SUB', 'ADD'] and len(oq) >= 3 and oq[-3] == 0 \
                and is_numberlike(oq[-2]):
            ntok = oq[-2]
            multipop(oq, 3).append(ntok)
    return oq


def compile_to_assembly(source, optimize_flag=1):
    if is_string(source):
        source = parse(source)
    c1 = rewrite(source)
    c2 = decorate(c1)
    label_counter[0] = 0
    varhash = {}
    c3 = compile_expr(c2, varhash)
    c4 = add_wrappers(c3, varhash)
    c5 = optimize(c4) if optimize_flag else c4
    return c5


def get_vars(source):
    if is_string(source):
        source = parse(source)
    varhash = {}
    c1 = rewrite(source)
    # fill varhash
    compile_expr(c1, varhash, [0])
    return varhash


def log256(n):
    return 0 if n == 0 else 1 + log256(n / 256)


def tobytearr(n, L):
    return [] if L == 0 else tobytearr(n / 256, L - 1) + [n % 256]


# Dereference labels
def dereference(c):
    label_length = log256(len(c)*4)
    iq = [x for x in c]
    mq = []
    pos = 0
    labelmap = {}
    beginning_stack = [0]
    while len(iq):
        front = iq.pop(0)
        if not is_numeric(front) and front[0] == '~':
            labelmap[front[1:]] = pos - beginning_stack[-1]
        elif front == '#CODE_BEGIN':
            beginning_stack.append(pos)
        elif front == '#CODE_END':
            beginning_stack.pop()
        else:
            mq.append(front)
            if is_numeric(front):
                pos += 1 + max(1, log256(front))
            elif front[:1] == '$':
                pos += label_length + 1
            else:
                pos += 1
    oq = []
    for m in mq:
        if is_numeric(m):
            L = max(1, log256(m))
            oq.append('PUSH' + str(L))
            oq.extend(tobytearr(m, L))
        elif m[:1] == '$':
            vals = m[1:].split('.')
            if len(vals) == 1:
                oq.append('PUSH'+str(label_length))
                oq.extend(tobytearr(labelmap[vals[0]], label_length))
            else:
                oq.append('PUSH'+str(label_length))
                value = labelmap[vals[1]] - labelmap[vals[0]]
                oq.extend(tobytearr(value, label_length))
        else:
            oq.append(m)
    return oq


def serialize(source):
    def numberize(arg):
        if is_numeric(arg):
            return arg
        elif arg in reverse_opcodes:
            return reverse_opcodes[arg]
        elif arg[:4] == 'PUSH':
            return 95 + int(arg[4:])
        elif re.match('^[0-9]*$', arg):
            return int(arg)
        else:
            raise Exception("Cannot serialize: " + str(arg))
    return ''.join(map(chr, map(numberize, source)))


def deserialize(source):
    o = []
    i, j = 0, -1
    while i < len(source):
        p = ord(source[i])
        if j >= 0:
            o.append(p)
        elif p >= 96 and p <= 127:
            o.append('PUSH' + str(p - 95))
        else:
            o.append(opcodes[p][0])
        if j < 0 and p >= 96 and p <= 127:
            j = p - 95
        j -= 1
        i += 1
    return o


def assemble(asm):
    return serialize(dereference(asm))


def compile(source):
    return assemble(compile_to_assembly(parse(source)))


def encode_datalist(vals):
    def enc(n):
        if is_numeric(n):
            return ''.join(map(chr, tobytearr(n, 32)))
        elif is_string(n) and len(n) == 40:
            return '\x00' * 12 + n.decode('hex')
        elif is_string(n):
            return '\x00' * (32 - len(n)) + n
        elif n is True:
            return 1
        elif n is False or n is None:
            return 0
    if isinstance(vals, (tuple, list)):
        return ''.join(map(enc, vals))
    elif vals == '':
        return ''
    else:
        # Assume you're getting in numbers or 0x...
        return ''.join(map(enc, map(numberize, vals.split(' '))))


def decode_datalist(arr):
    if isinstance(arr, list):
        arr = ''.join(map(chr, arr))
    o = []
    for i in range(0, len(arr), 32):
        o.append(frombytes(arr[i:i + 32]))
    return o
