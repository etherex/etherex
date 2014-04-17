#! /usr/bin/env python
import subprocess

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

print '\n'
print '==================='
print 'EtherEx LVM'
print '==================='
# subprocess.call(["serpent", "compile", "contracts/etherex.ser"])
# import serpent
from serpent import compiler
t = open('contracts/etherex.ser').readlines()
i = 0
while 1:
    o = []
    while i < len(t) and (not len(t[i]) or t[i][0] != '='):
        o.append(t[i])
        i += 1
    i += 1
    print '================='
    text = '\n'.join(o).replace('\n\n','\n')
    # print text
    ast = compiler.parse(text)
    print "AST:",ast
    print ""
    aevm = compiler.compile('\n'.join(t))
    print "AEVM:", aevm # ' '.join([str(x) for x in aevm])
    print ""
    code = compiler.compile_to_assembly(compiler.parse(aevm))
    print "Output:",' '.join([str(x) for x in code])
    if i >= len(t):
        break


print '\n'
print '==================='
print 'WARNING: Experimental code, use at your own risks.'
print '==================='