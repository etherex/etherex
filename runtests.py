#! /usr/bin/env python
# runtests.py -- EtherEx tests launcher
#
# Copyright (c) 2014 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

import subprocess
# import os
import sys
import json
sys.path.insert(0, './serpent')
import serpent

def compile_from_assembly(source): return serpent.serialize(serpent.dereference(json.loads(source)))

def compile(f):
  t = open(f).readlines()
  i = 0
  while 1:
    o = []
    while i < len(t) and (not len(t[i]) or t[i][0] != '='):
      o.append(t[i])
      i += 1
    i += 1
    print '================='
    text = '\n'.join(o).replace('\n\n', '\n')
    # print text

    # ast = serpent.parse(text)
    # print "AST:", ast
    # print ""

    lll = serpent.compile_to_lll(text)
    print "LLL:", lll
    print ""

    aevm = serpent.pretty_compile_lll(lll)
    print "AEVM:", aevm # .encode('hex') # ' '.join([str(x) for x in aevm])
    print ""

    # print ' '.join([str(x) for x in aevm])
    # s = open(f).read()
    code = serpent.compile(text)
    print "HEX:", code.encode('hex')
    print ""
    # code = compiler.decode_datalist(compiler.encode_datalist(ast))

    # ops = serpent.analyze(ast)
    # print "Analysis:", ops
    # print ""

    # code = serpent.assemble(aevm)
    # print "Output:", aevm
    # print "0x" + code.encode('hex') #' '.join([str(x) for x in aevm])

    # print "Int:"
    # asint = int(code.encode('hex'), 16)
    # print asint
    # print ""
    # aslist = compiler.decode_datalist("0x" + code.encode('hex'))

    # print "Datalist of size %d:" % len(aslist)
    # hexlist = list()
    # for item in aslist:
    #   hexlist.append(hex(item)[:-1])
    # print hexlist
    # print ""

    # print "Decoded hex:"
    # ashex = list()
    # for item in hexlist:
    #   ashex.append(int(item, 16))
    # ascode = compiler.encode_datalist(ashex).replace('\n', '')
    # print ascode

    # print "Serialized:"
    # print compile_from_assembly(json.dumps(ast))
    # print ""

    # strcode = "0x" + code.encode('hex')
    # print strcode
    # print (type(ascode), type(strcode), len(ascode), len(strcode))
    # print (intern(strcode) == intern(ascode))
    # if (intern(ascode) == intern(strcode)):
    #   print "Code OK"
    # else:
    #   print "Code mismatch"

    if i >= len(t):
      break

# print '\n'
# print '==================='
# print 'Compiler tests'
# print '==================='
# origwd = os.getcwd() # remember our original working directory
# os.chdir('serpent')
# subprocess.call(["python", "runtests.py"])
# os.chdir(origwd)

# print '\n'
# print '==================='
# print 'EtherEx simulations'
# print '==================='
# subprocess.call(["cll-sim/run.py", "simulations/etherex.py"])

print '\n'
print '==================='
print 'EtherEx LVM'
print '==================='
# subprocess.call(["serpent", "compile", "contracts/etherex.se"])

print 'Balances'
print '\n'
f = 'contracts/balances.se'
compile(f)
print '=' * 20
print '\n'

print 'Indexes'
print '\n'
f = 'contracts/indexes.se'
compile(f)
print '=' * 20
print '\n'

print 'Trades'
print '\n'
f = 'contracts/trades.se'
compile(f)
print '=' * 20
print '\n'

print 'Markets'
print '\n'
f = 'contracts/markets.se'
compile(f)
print '=' * 20
print '\n'

print 'ETX'
print '\n'
f = 'contracts/etx.se'
compile(f)
print '=' * 20
print '\n'


print 'EtherEx'
print '\n'
f = 'contracts/etherex.se'
compile(f)

subprocess.call(["py.test", "tests/etherex.py", "-v", "-x"])

print '==================='
print 'WARNING: Experimental code, use at your own risks.'
print '==================='