#!/usr/bin/python
import re, sys, os
from cllparser import *

optable = { 
    '+': 'ADD',
    '-': 'SUB',
    '*': 'MUL',
    '/': 'DIV',
    '^': 'EXP',
    '%': 'MOD',
    '#/': 'SDIV',
    '#%': 'SMOD',
    '==': 'EQ',
    '<=': 'LE',
    '>=': 'GE',
    '<': 'LT',
    '>': 'GT',
    'and': 'AND',
    'or': 'OR',
    'xor': 'XOR',
    '&&': 'AND',
    '||': 'OR'
}

funtable = {
    'sha3': ['SHA3', 3, 1],
    'ecrecover': ['ECRECOVER', 4, 1],
    'mkcall': ['CALL', 7, 1],
    'create': ['CREATE', 5, 1],
    'return': ['RETURN', 2, 0],
    'suicide': ['SUICIDE', 1, 0]
}

pseudovars = {
    'call.datasize': 'CALLDATAN',
    'call.sender': 'CALLER',
    'call.value': 'CALLVALUE',
    'call.gasprice': 'GASPRICE',
    'call.origin': 'ORIGIN',
    'balance': 'BALANCE',
    'gas': 'GAS',
    'block.prevhash': 'BLK_PREVHASH',
    'block.coinbase': 'BLK_COINBASE',
    'block.timestamp': 'BLK_TIMESTAMP',
    'block.number': 'BLK_NUMBER',
    'block.difficulty': 'BLK_DIFFICULTY',
    'block.gaslimit': 'GASLIMIT',
}

pseudoarrays = {
    'contract.storage': 'SLOAD',
    'block.address_balance': 'BALANCE',
}

def frombytes(b):
    return 0 if len(b) == 0 else ord(b[-1]) + 256 * frombytes(b[:-1])

def is_numberlike(b):
    if isinstance(b,(str,unicode)):
        if re.match('^[0-9\-]*$',b):
            return True
        if b[0] in ["'",'"'] and b[-1] in ["'",'"'] and b[0] == b[-1]:
            return True
    return False

def numberize(b):
    if b[0] in ["'",'"']: return frombytes(b[1:-1])
    else: return int(b)

# Left-expressions can either be:
# * variables
# * A[B] where A is a left-expr and B is a right-expr
# * contract.storage[B] where B is a right-expr
def get_left_expr_type(expr):
    if isinstance(expr,str):
        return 'variable'
    elif expr[0] == 'access' and expr[1] == 'contract.storage':
        return 'storage'
    else:
        return 'access'

def compile_left_expr(expr,varhash):
    typ = get_left_expr_type(expr)
    if typ == 'variable':
        if is_numberlike(expr):
            raise Exception("Can't set the value of a number! "+expr)
        elif expr in varhash:
            return ['PUSH',varhash[expr]]
        elif expr == 'call.data':
            return ['PUSH','_CALLDATALOC','MLOAD']
        else:
            varhash[expr] = len(varhash) * 32
            return ['PUSH',varhash[expr]]
    elif typ == 'storage':
        return compile_expr(expr[2],varhash)
    elif typ == 'access':
        if get_left_expr_type(expr[1]) == 'storage':
            return compile_left_expr(expr[1],varhash) + ['SLOAD'] + compile_expr(expr[2],varhash)
        elif is_numberlike(expr[2]):
            return compile_left_expr(expr[1],varhash) + [numberize(expr[2])*32, 'ADD']
        else:
            return compile_left_expr(expr[1],varhash) + compile_expr(expr[2],varhash) + ['PUSH',32,'MUL','ADD']
    else:
        raise Exception("invalid op: "+expr[0])

# Right-hand-side expressions (ie. the normal kind)
def compile_expr(expr,varhash):
    if isinstance(expr,str):
        if is_numberlike(expr):
            return ['PUSH',numberize(expr)]
        elif expr in varhash:
            return ['PUSH',varhash[expr],'MLOAD']
        elif expr in pseudovars:
            return [pseudovars[expr]]
        elif expr == 'call.data':
            return ['PUSH','_CALLDATALOC','MLOAD']
        else:
            varhash[expr] = len(varhash) * 32
            return ['PUSH',varhash[expr],'MLOAD']
    elif expr[0] in optable:
        if len(expr) != 3:
            raise Exception("Wrong number of arguments: "+str(expr)) 
        f = compile_expr(expr[1],varhash)
        g = compile_expr(expr[2],varhash)
        return g + f + [optable[expr[0]]]
    elif expr[0] == 'fun' and expr[1] in funtable:
        if len(expr) != funtable[expr[1]][1] + 2:
            raise Exception("Wrong number of arguments: "+str(expr)) 
        f = sum([compile_expr(e,varhash) for e in expr[2:]],[])
        return f + [funtable[expr[1]][0]]
    elif expr[0] == 'fun' and expr[1] == 'bytes':
        return compile_expr(expr[2],varhash) + ['MSIZE','SWAP','MSIZE','ADD','PUSH',1,'SUB','PUSH',0,'MSTORE8']
    elif expr[0] == 'fun' and expr[1] == 'array':
        if is_numberlike(expr[2]):
            return [numberize(expr[2])*32,'MSIZE','SWAP','MSIZE','ADD','PUSH',1,'SUB','PUSH',0,'MSTORE8']
        else: 
            return compile_expr(expr[2],varhash) + ['PUSH',32,'MUL','MSIZE','SWAP','MSIZE','ADD','PUSH',1,'SUB','PUSH',0,'MSTORE8']
    elif expr[0] == 'access':
        if expr[1] in pseudoarrays:
            return compile_expr(expr[2],varhash) + [pseudoarrays[expr[1]]]
        elif len(expr) == 3 or (len(expr) == 4 and expr[3] == ':'):
            if is_numberlike(expr[2]):
                middle = [numberize(expr[2])*32]
            else:
                middle = compile_expr(expr[2],varhash) + ['PUSH',32,'MUL']
            if len(expr) == 3:
                end = ['MLOAD']
            else:
                end = []
            return compile_left_expr(expr[1],varhash) + middle + ['ADD'] + end
        else:
            raise Exception("Weird parameters for array access")
    elif expr[0] == '!':
        f = compile_expr(expr[1],varhash)
        return f + ['NOT']
    elif expr[0] in pseudoarrays:
        return compile_expr(expr[1],varhash) + pseudoarrays[expr[0]]
    else:
        raise Exception("invalid op: "+expr[0])

# Statements (ie. if, while, a = b, a,b,c = d,e,f, [ s1, s2, s3 ], stop, suicide)
def compile_stmt(stmt,varhash={},lc=[0]):
    if stmt[0] == 'if':
        f = compile_expr(stmt[1],varhash)
        g = compile_stmt(stmt[2],varhash,lc)
        h = compile_stmt(stmt[3],varhash,lc) if len(stmt) > 3 else None
        label, ref = 'LABEL_'+str(lc[0]), 'REF_'+str(lc[0])
        lc[0] += 1
        if h: return f + [ 'NOT', ref, 'JUMPI' ] + g + [ ref, 'JUMP' ] + h + [ label ]
        else: return f + [ 'NOT', ref, 'JUMPI' ] + g + [ label ]
    elif stmt[0] == 'while':
        f = compile_expr(stmt[1],varhash)
        g = compile_stmt(stmt[2],varhash,lc)
        beglab, begref = 'LABEL_'+str(lc[0]), 'REF_'+str(lc[0])
        endlab, endref = 'LABEL_'+str(lc[0]+1), 'REF_'+str(lc[0]+1)
        lc[0] += 2
        return [ beglab ] + f + [ 'NOT', endref, 'JUMPI' ] + g + [ begref, 'JUMP', endlab ]
    elif stmt[0] == 'set':
        lexp = compile_left_expr(stmt[1],varhash)
        rexp = compile_expr(stmt[2],varhash)
        lt = get_left_expr_type(stmt[1])
        return rexp + lexp + ['SSTORE' if lt == 'storage' else 'MSTORE']
    elif stmt[0] == 'seq':
        o = []
        for s in stmt[1:]:
            o.extend(compile_stmt(s,varhash,lc))
        return o
    elif stmt == 'stop':
        return [ 'STOP' ]
    elif stmt[0] == 'fun' and stmt[1] in funtable:
        f = sum([compile_expr(e,varhash) for e in stmt[2:]],[])
        if len(stmt) != funtable[stmt[1]][1] + 2:
            raise Exception("Wrong number of arguments: "+str(stmt)) 
        o = f + [funtable[stmt[1]][0]]
        if stmt[1][2] == 0:
            o += ['POP']
        return o

# Experimental
def get_vars(thing,h={}):
    if thing[0] in ['seq','if','while','set','access']:
        for t in thing[1:]: h = get_vars(t,h)
    elif thing[0] == 'fun':
        for t in thing[2:]: h = get_vars(t,h)
    elif isinstance(thing,(str,unicode)) and thing not in pseudovars and thing not in pseudoarrays:
        h[thing] = true
    return h

# Stuff to add once to each program
def add_wrappers(c,varcount=99):
    if '_CALLDATALOC' in c:
        prefix = ['PUSH',varcount*32,'DUP','CALLDATA']
        c = prefix + [varcount*32 if x == '_CALLDATALOC' else x for x in c]
    return c
        
        
# Dereference labels
def assemble(c,varcount=99):
    iq = [x for x in c]
    mq = []
    pos = 0
    labelmap = {}
    while len(iq):
        front = iq.pop(0)
        if isinstance(front,str) and front[:6] == 'LABEL_':
            labelmap[front[6:]] = pos
        else:
            mq.append(front)
            pos += 2 if isinstance(front,str) and front[:4] == 'REF_' else 1
    oq = []
    for m in mq:
        if isinstance(m,str) and m[:4] == 'REF_':
            oq.append('PUSH')
            oq.append(labelmap[m[4:]])
        else: oq.append(m)
    return oq

def compile_to_aevm(source):
    if isinstance(source,(str,unicode)): source = parse(source)
    #print p
    varhash = {}
    c = compile_stmt(source,varhash)
    return add_wrappers(c,len(varhash))

def compile(source): return assemble(compile_to_aevm(source))

if len(sys.argv) >= 2:
    if os.path.exists(sys.argv[1]):
        open(sys.argv[1]).read()
        print ' '.join([str(k) for k in compile(open(sys.argv[1]).read())])
    else:
        print ' '.join([str(k) for k in compile(sys.argv[1])])
