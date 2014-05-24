#! /usr/bin/env python
# import serpent
import subprocess
import sys
import json
sys.path.insert(0, './serpent')
from serpent import parser, rewriter, compiler

def compile_from_assembly(source): return compiler.serialize(compiler.dereference(json.loads(source)))

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

    ast = parser.parse(text)
    print "AST:", ast
    print ""

    ast2 = rewriter.compile_to_lll(ast)
    print "LLL:", ast2
    print ""
    # print ' '.join([str(x) for x in aevm])
    # s = open(f).read()
    # code = compiler.compile(text)
    # code = compiler.decode_datalist(compiler.encode_datalist(ast))

    ops = rewriter.analyze(ast)
    print "Analysis:", ops
    print ""

    aevm = compiler.compile_lll(ast2)
    print "AEVM:", ' '.join([str(x) for x in aevm])
    print ""
    code = compiler.assemble(aevm)
    print "Output:", code.encode('hex')
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

print '\n'
print '==================='
print 'Compiler tests'
print '==================='
subprocess.call(["python", "serpent/runtests.py"])

print '\n'
print '==================='
print 'EtherEx simulations'
print '==================='
subprocess.call(["cll-sim/run.py", "simulations/etherex.py"]) # , "contracts/etherex.cll"])
subprocess.call(["py.test", "tests/etherex.py", "-v"]) # , "contracts/etherex.cll"])

print '\n'
print '==================='
print 'EtherEx LVM'
print '==================='
# subprocess.call(["serpent", "compile", "contracts/etherex.ser"])

print 'Balances (XETH)'
print '\n'
# print 'init:'
# f = 'contracts/balances_init.ser'
# compile(f)
# print '=' * 20
# print 'code:'
f = 'contracts/balances.ser'
compile(f)
print '=' * 20
print '\n'

print 'Indexes'
print '\n'
# print 'init:'
# f = 'contracts/indexes_init.ser'
# compile(f)
# print '=' * 20
# print 'code'
f = 'contracts/indexes.ser'
compile(f)
print '=' * 20
print '\n'

print 'Trades'
print '\n'
# print 'init:'
# f = 'contracts/trades_init.ser'
# compile(f)
# print '=' * 20
# print 'code'
f = 'contracts/trades.ser'
compile(f)
print '=' * 20
print '\n'

print 'Currencies (Markets)'
print '\n'
# print 'init:'
# f = 'contracts/currencies_init.ser'
# compile(f)
# print '=' * 20
# print 'code:'
f = 'contracts/currencies.ser'
compile(f)
print '=' * 20
print '\n'

print 'EtherEx'
print '\n'
# print 'init:'
# f = 'contracts/etherex_init.ser'
# compile(f)
# print '=' * 20
# print 'code'
f = 'contracts/etherex.ser'
compile(f)
# print '=' * 20
# print 'TMP'
# f = 'contracts/tmp.ser'
# compile(f)

print '==================='
print 'WARNING: Experimental code, use at your own risks.'
print '==================='