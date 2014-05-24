#!/usr/bin/python
import re
from parser import parse
import utils
token, astnode = utils.token, utils.astnode

from opcodes import opcodes, reverse_opcodes

from rewriter import compile_to_lll


label_counter = [0]


def mksymbol():
    label_counter[0] += 1
    return '_' + str(label_counter[0] - 1)


# Compile LLL to EVM
def compile_lll(ast):
    symb = mksymbol()
    tokenify2 = lambda x: utils.tokenify(x, *ast.metadata)
    # Literals
    if not isinstance(ast, astnode):
        return [token(utils.numberize(ast.val), *ast.metadata)]
    subcodes = map(compile_lll, ast.args)
    # Seq
    if ast.fun == 'seq':
        o = []
        for subcode in subcodes:
            o.extend(subcode)
        return o
    elif ast.fun == 'unless' and len(ast.args) == 2:
        out = subcodes[0] + ['$endif'+symb, 'JUMPI'] + \
            subcodes[1] + ['~endif'+symb]
    elif ast.fun == 'if' and len(ast.args) == 3:
        out = subcodes[0] + ['NOT', '$else'+symb, 'JUMPI'] + \
            subcodes[1] + ['$endif'+symb, 'JUMP', '~else'+symb] + \
            subcodes[2] + ['~endif'+symb]
    elif ast.fun == 'until':
        out = ['~beg'+symb] + subcodes[0] + ['$end'+symb, 'JUMPI'] + \
            subcodes[1] + ['$beg'+symb, 'JUMP', '~end'+symb]
    elif ast.fun == 'lll':
        LEN = '$begincode'+symb+'.endcode'+symb
        STARTSYMB, STARTIND = '~begincode'+symb, '$begincode'+symb
        ENDSYMB, ENDIND = '~endcode'+symb, '$endcode'+symb
        out = [LEN, 'DUP'] + subcodes[1] + [STARTIND, 'CODECOPY'] + \
            [ENDIND, 'JUMP', STARTSYMB, '#CODE_BEGIN'] + subcodes[0] + \
            ['#CODE_END', ENDSYMB]
    elif ast.fun == 'alloc':
        out = subcodes[0] + ['MSIZE', 'SWAP', 'MSIZE'] + \
            ['ADD', 1, 'SWAP', 'SUB', 0, 'SWAP', 'MSTORE8']
    elif ast.fun == 'array_lit':
        x = ['MSIZE', 'DUP']
        for s in subcodes:
            x += s + ['SWAP', 'MSTORE', 'DUP', 32, 'ADD']
        out = x[:-3] if len(subcodes) > 0 else ['MSIZE']
    else:
        o = []
        for subcode in subcodes[::-1]:
            o.extend(subcode)
        out = o + [token(ast.fun, *ast.metadata)]
    return map(tokenify2, out)


# Dereference labels
def dereference(c):
    c = map(utils.tokenify, c)
    label_length = utils.log256(len(c)*4)
    iq = [x for x in c]
    mq = []
    pos = 0
    labelmap = {}
    beginning_stack = [0]
    while len(iq):
        front = iq.pop(0)
        if not utils.is_numeric(front.val) and front.val[0] == '~':
            labelmap[front.val[1:]] = pos - beginning_stack[-1]
        elif front.val == '#CODE_BEGIN':
            beginning_stack.append(pos)
        elif front.val == '#CODE_END':
            beginning_stack.pop()
        else:
            mq.append(front)
            if utils.is_numeric(front.val):
                pos += 1 + max(1, utils.log256(front.val))
            elif front.val[:1] == '$':
                pos += label_length + 1
            else:
                pos += 1
    oq = []
    for m in mq:
        oqplus = []
        if utils.is_numeric(m.val):
            L = max(1, utils.log256(m.val))
            oqplus.append('PUSH' + str(L))
            oqplus.extend(utils.tobytearr(m.val, L))
        elif m.val[:1] == '$':
            vals = m.val[1:].split('.')
            if len(vals) == 1:
                oqplus.append('PUSH'+str(label_length))
                oqplus.extend(utils.tobytearr(labelmap[vals[0]], label_length))
            else:
                oqplus.append('PUSH'+str(label_length))
                value = labelmap[vals[1]] - labelmap[vals[0]]
                oqplus.extend(utils.tobytearr(value, label_length))
        else:
            oqplus.append(m)
        oq.extend(map(lambda x: utils.tokenify(x, *m.metadata), oqplus))
    return oq


def serialize(source):
    def numberize(arg):
        if utils.is_numeric(arg):
            return arg
        elif arg in reverse_opcodes:
            return reverse_opcodes[arg]
        elif arg[:4] == 'PUSH':
            return 95 + int(arg[4:])
        elif re.match('^[0-9]*$', arg):
            return int(arg)
        else:
            raise Exception("Cannot serialize: " + str(arg))
    return ''.join(map(chr, map(numberize, map(utils.detokenify, source))))


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
    return map(utils.tokenify,o)


def assemble(source):
    return serialize(dereference(source))


def compile(source):
    return assemble(compile_lll(compile_to_lll(parse(source))))


def encode_datalist(vals):
    def enc(n):
        if utils.is_numeric(n):
            return ''.join(map(chr, utils.tobytearr(n, 32)))
        elif utils.is_string(n) and len(n) == 40:
            return '\x00' * 12 + n.decode('hex')
        elif utils.is_string(n):
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
        return ''.join(map(enc, map(utils.numberize, vals.split(' '))))


def decode_datalist(arr):
    if isinstance(arr, list):
        arr = ''.join(map(chr, arr))
    o = []
    for i in range(0, len(arr), 32):
        o.append(utils.frombytes(arr[i:i + 32]))
    return o
